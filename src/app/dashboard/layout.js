import TopRibbon from '@/components/TopRibbon';

export default function DashboardLayout({ children }) {
  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      <TopRibbon />
      <div className="flex flex-1 overflow-hidden">
 
        {/* side bar */}

        <main className="flex-1 bg-white overflow-auto p-4">
          {children}
        </main>
      </div>
    </div>
  );
}
