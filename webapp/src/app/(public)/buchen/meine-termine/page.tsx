import { PublicPortalPolicies } from "@/components/public/PublicPortalPolicies";
import { GuestPortalPageClient } from "@/features/public-booking/GuestPortalPageClient";
import { getGuestCancelMinHours } from "@/lib/guest-cancel-policy";

export const dynamic = "force-dynamic";

export default function MeineTerminePage() {
  const cancelMinHours = getGuestCancelMinHours();
  return (
    <>
      <PublicPortalPolicies cancelMinHours={cancelMinHours} />
      <GuestPortalPageClient cancelMinHours={cancelMinHours} />
    </>
  );
}
