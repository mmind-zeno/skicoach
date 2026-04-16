import { isLandingPilotEnabled } from "@/lib/landing-pilot";
import { LoginClient } from "./login-client";

export default function LoginPage() {
  const pilot = isLandingPilotEnabled();
  return <LoginClient pilot={pilot} />;
}
