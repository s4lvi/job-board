import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: "📊" },
  { href: "/dashboard/listings", label: "My Listings", icon: "📋" },
  { href: "/dashboard/applications", label: "Applications", icon: "📨" },
  { href: "/dashboard/contracts", label: "Contracts", icon: "📄" },
  { href: "/dashboard/earnings", label: "Earnings", icon: "💰" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="lg:w-56 shrink-0">
          <div className="mb-6">
            <p className="text-xs text-white/40 uppercase tracking-[0.2em] mb-1">Dashboard</p>
            <p className="font-bold text-sm">{session.user.name}</p>
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-white/40 hover:text-white hover:bg-white/5 transition-colors"
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
