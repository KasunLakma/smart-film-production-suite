import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-studio-950 text-slate-100 font-sans">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto bg-studio-950 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
