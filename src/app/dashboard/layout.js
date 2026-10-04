"use client";
import BottomRibbon from '@/components/BottomRibbon';
import Loading from '@/components/Loading';
import RibbonPanel from '@/components/RibbonPanel';
import { ClientProvider } from '@/context/ClientContext';
import { FormStatusContext } from '@/context/FormStatusContext';
import { UnitProvider } from '@/context/UnitContext';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { hasValidSession, logout, watchSession, clearSession } from '@/lib/auth';

const IDLE_TIMEOUT = 30 * 60 * 1000;

export default function DashboardLayout({ children }) {
  const [activeTab, setActiveTab] = useState('');
  const [activeButton, setActiveButton] = useState('');
  const [formStatus, setFormStatus] = useState("");
  // Security: nothing inside the dashboard is rendered until a valid session is confirmed
  // (prevents protected data flashing after logout, e.g. via the Back button).
  const [authorized, setAuthorized] = useState(false);
  // const [loading, setLoading] = useState(true); 

  const router = useRouter();

  const idleTimerRef = useRef(null);

  const logoutUser = () => {
    // toast.error("Session expired due to inactivity");
    logout(); // revokes the token on the server, clears storage, replaces history
  };

  // Session guard: check on mount and whenever the page is shown again
  // (Back/Forward cache, tab focus, logout in another tab, token expiry).
  useEffect(() => {
    if (!hasValidSession()) {
      clearSession();
      window.location.replace("/login");
      return;
    }
    setAuthorized(true);
    return watchSession(() => {
      setAuthorized(false);
      window.location.replace("/login");
    });
  }, []);

  const resetIdleTimer = () => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }

    idleTimerRef.current = setTimeout(logoutUser, IDLE_TIMEOUT);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
    ];

    events.forEach(event =>
      window.addEventListener(event, resetIdleTimer)
    );

    resetIdleTimer(); // start timer on mount

    return () => {
      events.forEach(event =>
        window.removeEventListener(event, resetIdleTimer)
      );
      clearTimeout(idleTimerRef.current);
    };
  }, []);

  // useEffect(() => {
  //   // Simulate data fetching or initialization
  //   const timer = setTimeout(() => {
  //     setLoading(false); // Hide loading screen when done
  //   }, 1000); // Replace with real fetch completion

  //   return () => clearTimeout(timer);
  // }, []);

  // if (loading) {
  //   return <Loading />;
  // }

  useEffect(() => {
    const handleKeyDown = async (e) => {
      const tag = e.target.tagName.toLowerCase();
      const isContentEditable = e.target.isContentEditable;
      
      console.log("=== KEY DOWN EVENT ===");
      console.log("Key:", e.key);
      console.log("Code:", e.code);
      console.log("Target tag:", tag);
      console.log("ContentEditable:", isContentEditable);
      console.log("Ctrl:", e.ctrlKey, "Shift:", e.shiftKey, "Alt:", e.altKey);
      
      // Allow key events in form fields
      if (tag === "input" || tag === "textarea" || isContentEditable) {
        console.log("Skipping - in form field");
        return;
      }
  
      let shouldNavigate = false;
      let path = null;
      let keyHandled = false;
    
      // -------- FUNCTION KEYS (Analytics) --------
      if (e.ctrlKey && !e.shiftKey && !e.altKey) {
        const analyticsKeyMap = {
          "4": "/dashboard/analytics-view/tabulation-tables",
          "5": "/dashboard/analytics-view/proficiency-metrics",
          "6": "/dashboard/analytics-view/growth-metrics",
          "7": "/dashboard/analytics-view/hybrid-metrics",
          "8": "/dashboard/analytics-view/unit-distributions",
          "9": "/dashboard/analytics-view/auxiliary-resultants",
          "0": "/dashboard/analytics-view/neuroscience-tools",
          "-": "/dashboard/analytics-view/global-analytics",
          "=": "/dashboard/analytics-view/data-extractions",
          "[": "/dashboard/analytics-view/data-reports",
        };
      
        const path = analyticsKeyMap[e.key];
      
        if (path) {
          e.preventDefault();
          e.stopPropagation();
      
          try {
            await router.push(path);
      
            setActiveTab("analytics");
            setActiveButton(""); 
          } catch (err) {
            console.error("Shortcut navigation failed", err);
            toast.error("Navigation failed");
          }
      
          return; // stop further processing
        }
      }
    
      // -------- CTRL shortcuts --------
      if (e.shiftKey && !e.ctrlKey && !e.altKey) {
        console.log("Shift key combo detected");

        switch (e.code) {
          case "Digit1":
            console.log("Shift+1 detected");
            e.preventDefault();
            router.push("/dashboard/control-view");
            setActiveTab("control");
            setActiveButton("");
            break;

          case "Digit2":
            console.log("Shift+2 detected");
            e.preventDefault();
            router.push("/dashboard/setup-view");
            setActiveTab("setup");
            setActiveButton("");
            break;

          case "Digit3":
            console.log("Shift+3 detected");
            e.preventDefault();
            router.push("/dashboard/analytics-view");
            setActiveTab("analytics");
            setActiveButton("");
            break;
        }
      }
    
      if (shouldNavigate && path) {
        try {
          console.log(`Attempting navigation to: ${path}`);
          await router.push(path);
          console.log("Navigation successful!");
          // Force a state update to ensure UI reflects the change
          setActiveTab(path.includes("control-view") ? "control" : 
                      path.includes("setup-view") ? "setup" : 
                      path.includes("analytics-view") ? "analytics" : "");
        } catch (error) {
          console.error("Navigation failed:", error);
          toast.error("Navigation failed");
        }
      } else if (!keyHandled) {
        console.log("Key was not handled by our switch statement");
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    console.log("Keyboard event listener added");
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      console.log("Keyboard event listener removed");
    };
  }, [router]);


  if (!authorized) return null;

  return (
    <FormStatusContext.Provider value={{ formStatus, setFormStatus }}>
      <UnitProvider>
        <ClientProvider>
          <div className="h-screen bg-white w-screen flex flex-col overflow-hidden">
            <RibbonPanel
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              activeButton={activeButton}
              setActiveButton={setActiveButton}
            />

            <div className="flex flex-1 overflow-hidden">
              {children}
            </div>

            <BottomRibbon activeTab={activeTab} activeButton={activeButton} formStatus={formStatus}  />
          </div>
        </ClientProvider>
      </UnitProvider>
    </FormStatusContext.Provider>
  );
}
