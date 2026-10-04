import { redirect } from "next/navigation";
import EvalzNowLanding from ".";
import EndSessionOnVisit from "@/components/EndSessionOnVisit";

export default function Home() {
  // redirect('/login');
  return (
    <>
      <EndSessionOnVisit />
      <EvalzNowLanding />
    </>
  );
}
