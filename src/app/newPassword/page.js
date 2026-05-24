import LoginForm from "@/components/LoginForm";
import TextSection from "@/components/TechSection";
import PasswordForm from "./components/PasswordForm";
import { Suspense } from "react";



export default function NewPassword() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <main className="md:flex block h-screen">
        <TextSection />
        <PasswordForm />
      </main>
    </Suspense>

  );
}
