import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import About from "@/components/landing/About";
import Programs from "@/components/landing/Programs";
import Startups from "@/components/landing/Startups";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await getCurrentUser();
  if (user) {
    redirect(user.role === "admin" ? "/admin" : user.role === "investor" ? "/investor" : "/founder");
  }

  return (
    <main>
      <Navbar />
      <Hero />
      <About />
      <Programs />
      <Startups />
      <CTA />
      <Footer />
    </main>
  );
}
