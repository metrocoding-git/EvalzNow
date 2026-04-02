import LoginForm from "@/components/LoginForm";
import TextSection from "@/components/TechSection";
import PasswordForm from "./components/PasswordForm";



export default function NewPassword() {
  return (
    <main className="md:flex block h-screen">
      <TextSection />
      <PasswordForm />
    </main>
  );
}
