"use client";

import { useRouter } from "next/navigation";
import { logout } from "@/lib/auth-client";

export default function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    await logout();
    router.refresh();
    router.push("/");
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="text-[13px] font-medium text-ink/60 transition-colors hover:text-ink"
    >
      Sign out
    </button>
  );
}
