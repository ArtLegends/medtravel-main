// app/contact-us/ContactUsForm.tsx
"use client";
import { useState } from "react";

type State = "idle" | "submitting" | "success" | "error";

export default function ContactUsForm() {
  const [state, setState] = useState<State>("idle");
  const [msg, setMsg] = useState<string>("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    const payload = {
      firstName: String(fd.get("firstName") ?? "").trim(),
      lastName:  String(fd.get("lastName")  ?? "").trim(),
      phone:     String(fd.get("phone")     ?? "").trim(),
      email:     String(fd.get("email")     ?? "").trim(),
      message:   String(fd.get("message")   ?? "").trim(),
    };

    setState("submitting"); setMsg("");

    try {
      const res  = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Failed");

      setState("success");
      setMsg("Your message has been sent. We will contact you soon.");
      form.reset();
    } catch (err: any) {
      setState("error");
      setMsg(err?.message || "Something went wrong. Try again later.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="firstName" className="mb-1 block text-sm font-medium">First Name</label>
          <input id="firstName" name="firstName" required placeholder="Enter your first name"
                 className="w-full rounded border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400" />
        </div>
        <div>
          <label htmlFor="lastName" className="mb-1 block text-sm font-medium">Last Name</label>
          <input id="lastName" name="lastName" required placeholder="Enter your last name"
                 className="w-full rounded border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400" />
        </div>
      </div>

      <div>
        <label htmlFor="phone" className="mb-1 block text-sm font-medium">Phone Number</label>
        <input id="phone" name="phone" type="tel" placeholder="Enter your phone number"
               className="w-full rounded border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400" />
      </div>

      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium">Email</label>
        <input id="email" name="email" type="email" required placeholder="Enter your email address"
               className="w-full rounded border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400" />
      </div>

      <div>
        <label htmlFor="message" className="mb-1 block text-sm font-medium">Message</label>
        <textarea id="message" name="message" rows={4} placeholder="How can we help?"
                  className="w-full rounded border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400" />
      </div>

      {state !== "idle" && (
        <p className={"text-sm " + (state === "success" ? "text-emerald-600" : state === "error" ? "text-rose-600" : "text-gray-500")}>
          {msg}
        </p>
      )}

      <div className="pt-2 text-center">
        <button type="submit" disabled={state === "submitting"}
                className="rounded bg-teal-600 px-6 py-3 font-medium text-white transition hover:bg-teal-700 disabled:opacity-60">
          {state === "submitting" ? "Sending..." : "Send Message"}
        </button>
      </div>
    </form>
  );
}
