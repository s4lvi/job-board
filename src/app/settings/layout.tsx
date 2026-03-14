import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

const settingsNav = [
  { href: "/settings", label: "Profile" },
  { href: "/settings/account", label: "Account" },
  { href: "/settings/payments", label: "Payments" },
  { href: "/settings/notifications", label: "Notifications" },
  { href: "/settings/verification", label: "Verification" },
];

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl md:text-3xl mb-8">Settings</h1>

      <div className="flex flex-col sm:flex-row gap-8">
        <nav className="sm:w-48 shrink-0">
          <div className="flex sm:flex-col gap-1 overflow-x-auto">
            {settingsNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-white/40 hover:text-white hover:bg-white/5 transition-colors whitespace-nowrap"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
