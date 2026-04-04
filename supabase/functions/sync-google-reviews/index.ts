// supabase/functions/sync-google-reviews/index.ts
// Deployed as Supabase Edge Function
// Called daily by pg_cron or manually

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GOOGLE_PLACES_API_KEY = Deno.env.get("GOOGLE_PLACES_API_KEY") ?? "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ─── Security ───
function isAuthorized(req: Request): boolean {
  const source = req.headers.get("x-internal-source");
  if (source === "pg_trigger" || source === "cron") return true;
  const auth = req.headers.get("authorization");
  if (auth === `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`) return true;
  return false;
}

// ─── Fetch reviews from Google Places API (New) ───
async function fetchGooglePlaceDetails(placeId: string) {
  const url = `https://places.googleapis.com/v1/places/${placeId}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
      "X-Goog-FieldMask": "displayName,rating,userRatingCount,reviews",
    },
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Google Places API error ${res.status}: ${errText}`);
  }

  return await res.json();
}

// ─── Sync one clinic ───
async function syncClinic(
  clinicId: string,
  placeId: string
): Promise<{ ok: boolean; reviewCount: number }> {
  const data = await fetchGooglePlaceDetails(placeId);

  const rating = data.rating ?? null;
  const reviewCount = data.userRatingCount ?? 0;

  // Update clinic's Google rating
  await supabase
    .from("clinics")
    .update({
      google_rating: rating,
      google_reviews_count: reviewCount,
      google_reviews_synced_at: new Date().toISOString(),
    })
    .eq("id", clinicId);

  // Upsert reviews (Google returns max 5 "most relevant")
  const reviews = data.reviews ?? [];
  let synced = 0;

  for (const r of reviews) {
    const authorName =
      r.authorAttribution?.displayName ?? "Anonymous";
    const authorPhoto =
      r.authorAttribution?.photoUri ?? null;
    const profileUrl = r.authorAttribution?.uri ?? null;
    const reviewRating = r.rating ?? 0;
    const reviewText =
      r.text?.text ?? r.originalText?.text ?? null;
    const lang =
      r.text?.languageCode ?? r.originalText?.languageCode ?? null;
    const relativeTime =
      r.relativePublishTimeDescription ?? null;
    const publishTime = r.publishTime ?? null;

    if (!authorName || !publishTime) continue;

    const { error } = await supabase.from("google_reviews").upsert(
      {
        clinic_id: clinicId,
        google_author_name: authorName,
        google_author_photo_url: authorPhoto,
        google_profile_url: profileUrl,
        rating: reviewRating,
        text: reviewText,
        language: lang,
        relative_time_description: relativeTime,
        publish_time: publishTime,
        synced_at: new Date().toISOString(),
      },
      {
        onConflict: "clinic_id,google_author_name,publish_time",
        ignoreDuplicates: false,
      }
    );

    if (!error) synced++;
    else
      console.error(
        `Upsert error for review by ${authorName}:`,
        error.message
      );
  }

  return { ok: true, reviewCount: synced };
}

// ─── Main handler ───
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
      },
    });
  }

  if (!isAuthorized(req)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  if (!GOOGLE_PLACES_API_KEY) {
    return new Response(
      JSON.stringify({ error: "GOOGLE_PLACES_API_KEY not configured" }),
      { status: 500 }
    );
  }

  try {
    // Optional: sync a specific clinic
    let targetClinicId: string | null = null;
    try {
      const body = await req.json();
      targetClinicId = body?.clinic_id ?? null;
    } catch {
      // No body — sync all
    }

    let query = supabase
      .from("clinics")
      .select("id, name, google_place_id")
      .not("google_place_id", "is", null);

    if (targetClinicId) {
      query = query.eq("id", targetClinicId);
    }

    const { data: clinics, error: fetchErr } = await query;

    if (fetchErr) {
      return new Response(JSON.stringify({ error: fetchErr.message }), {
        status: 500,
      });
    }

    if (!clinics || clinics.length === 0) {
      return new Response(
        JSON.stringify({
          message: "No clinics with google_place_id found",
        }),
        { status: 200 }
      );
    }

    const results: Array<{
      clinic: string;
      status: string;
      reviews?: number;
    }> = [];

    for (const clinic of clinics) {
      try {
        const res = await syncClinic(clinic.id, clinic.google_place_id!);
        results.push({
          clinic: clinic.name,
          status: "synced",
          reviews: res.reviewCount,
        });
        console.log(`Synced ${clinic.name}: ${res.reviewCount} reviews`);
      } catch (err: any) {
        results.push({
          clinic: clinic.name,
          status: `error: ${err.message}`,
        });
        console.error(`Failed to sync ${clinic.name}:`, err.message);
      }

      // Small delay between clinics to avoid rate limiting
      await new Promise((r) => setTimeout(r, 200));
    }

    return new Response(
      JSON.stringify({ synced: results.length, results }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err: any) {
    console.error("sync-google-reviews error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
    });
  }
});