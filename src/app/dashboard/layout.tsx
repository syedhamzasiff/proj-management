import Sidebar from "@/components/layout/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-100">
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
