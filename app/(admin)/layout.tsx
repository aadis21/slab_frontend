import { AdminNavbar } from '@/components/AdminNavbar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <AdminNavbar />
      {/* Desktop: offset for admin sidebar; Mobile: offset for top+bottom bars */}
      <main className="lg:ml-64 pt-0 lg:pt-0 pb-16 lg:pb-0">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 lg:py-8">
          {/* Mobile top bar spacer */}
          <div className="lg:hidden h-14 mb-2" />
          {children}
        </div>
      </main>
    </div>
  );
}
