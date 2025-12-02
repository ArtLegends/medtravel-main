// app/(partner)/partner/settings/page.tsx
import { redirect } from "next/navigation";

export default function PartnerSettingsRedirect() {
  redirect("/settings");
}
