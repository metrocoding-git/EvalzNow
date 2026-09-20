"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getStaffById } from "@/services/staffService";

const tabs = [
  { label: "Admin", path: "/dashboard/control-view/admin" },
  { label: "Staff", path: "/dashboard/control-view/staff" },
  { label: "Candidate", path: "/dashboard/control-view/candidate" },
  { label: "Unit", path: "/dashboard/control-view/unit" },
];

// which tabs each role / access level can see
const TAB_ACCESS = {
  "super admin": ["Admin", "Staff", "Candidate", "Unit"],
  admin: ["Staff", "Candidate", "Unit"],
  staff: {
    "Full Access": ["Staff", "Candidate", "Unit"],
    "Leaders Access": ["Candidate", "Unit"],
  },
};

export default function ControlViewLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const [loggedInUser, setLoggedInUser] = useState(null);
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isStaff = loggedInUser?.role === "staff";

  // Read the login once on the client; redirect if missing
  useEffect(() => {
    const token = localStorage.getItem("token");
    const raw = localStorage.getItem("user");
    if (!token || !raw) {
      router.replace("/login");
      return;
    }
    setLoggedInUser(JSON.parse(raw));
  }, [router]);

  // Fetch the staff record only for staff users
  useEffect(() => {
    if (!isStaff || !loggedInUser?.staffId) return;

    const fetchStaffById = async () => {
      try {
        setLoading(true);
        setStaff(await getStaffById(loggedInUser.staffId));
      } catch (err) {
        console.error("Failed to fetch staff:", err);
        setError("Failed to load staff data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchStaffById();
  }, [isStaff, loggedInUser?.staffId]);

  const visibleTabs = useMemo(() => {
    if (!loggedInUser) return [];

    let allowed = [];
    if (isStaff) {
      allowed = TAB_ACCESS.staff[staff?.accessLevel] ?? [];   // empty until the staff record loads
    } else {
      allowed = TAB_ACCESS[loggedInUser.role] ?? [];
    }
    return tabs.filter((tab) => allowed.includes(tab.label));
  }, [loggedInUser, isStaff, staff?.accessLevel]);

  // Active tab comes from the URL, so it is right even when tabs load late
  const activeTab = visibleTabs.find((tab) => pathname?.startsWith(tab.path))?.label;

  // If the current URL isn't allowed, go to the first allowed tab
  useEffect(() => {
    if (!loggedInUser) return;
    if (isStaff && !staff) return;               // wait for access level
    if (!visibleTabs.length) return;

    const isValidPath = visibleTabs.some((tab) => pathname?.startsWith(tab.path));
    if (!isValidPath) router.replace(visibleTabs[0].path);
  }, [pathname, visibleTabs, loggedInUser, isStaff, staff, router]);

  return (
    <div className="w-full flex flex-col">
      <div className="h-full flex flex-col overflow-hidden m-0.5 border-1 border-gray-200">
        {/* Tab buttons */}
        <div className="flex space-x-0 border-b border-gray-200 bg-gray-50 mt-1.5">
          {visibleTabs.map((tab) => (
            <Link href={tab.path} key={tab.path}>
              <span
                className={
                  `relative px-8.5 py-2 text-sm font-medium transition-all duration-200 ease-in-out cursor-pointer ` +
                  (activeTab === tab.label
                    ? "text-black bg-white border-t-2 border-blue-400 shadow-sm"
                    : "text-gray-500 hover:text-gray-800 border-t border-r border-b-transparent border-gray-300 hover:bg-white")
                }
              >
                {tab.label}
              </span>
            </Link>
          ))}
        </div>

        {/* Active tab content */}
        <div className="flex-1 overflow-auto bg-white border border-t-0 border-gray-300 p-1">
          <div className="flex flex-col h-full">{children}</div>
        </div>
      </div>
    </div>
  );
}