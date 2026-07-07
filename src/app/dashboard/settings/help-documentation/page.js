// app/dashboard/settings/help-documentation/page.jsx
"use client";
import { Suspense } from "react";
import HelpViewer from "./components/HelpViewer";

 // ← add this

// import HelpViewer from "./HelpViewer";

export default function HelpDocumentationPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HelpViewer />
    </Suspense>
  )
}