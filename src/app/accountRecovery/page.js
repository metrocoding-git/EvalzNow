import LoginForm from "@/components/LoginForm";
import TextSection from "@/components/TechSection";
import RecoverForm from "./components/RecoverForm";



export default function RecoveryAccount() {
  return (
    <main className="md:flex block h-screen">
      <TextSection />
      <RecoverForm />
    </main>
  );
}
