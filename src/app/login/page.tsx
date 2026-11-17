import AdminLogin from "@/components/portal/AdminLogin";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect(user.role === "admin" ? "/admin" : user.role === "investor" ? "/investor" : "/founder");
  }

  return <AdminLogin />;
}
