import LoginForm from "@/components/LoginForm";
import TextSection from "@/components/TechSection";



export default function Login() {
  return (
    <main className="flex flex-col md:flex-row min-h-screen">
      <TextSection />
      <LoginForm />
    </main>
  );
}
