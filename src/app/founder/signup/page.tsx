import FounderSignup from "@/components/portal/FounderSignup";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function FounderSignupPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect(user.role === "admin" ? "/admin" : user.role === "investor" ? "/investor" : "/founder");
  }

  return <FounderSignup />;
}
