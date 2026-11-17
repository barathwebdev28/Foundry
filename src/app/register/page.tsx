import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import ApplicationForm from "@/components/portal/ApplicationForm";

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/founder/signup");
  if (user.role !== "founder") redirect("/login");
  return <ApplicationForm />;
}
