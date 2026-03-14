import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-3">
            <Image src="/logo.svg" alt="ACP" width={40} height={33} className="h-8 w-auto" />
            <span className="font-black text-lg uppercase tracking-[0.15em]">
              <span className="text-primary">Jobs</span>
            </span>
          </Link>
        </div>
        <div className="border border-white/5 bg-surface p-8 card-cut">
          {children}
        </div>
      </div>
    </div>
  );
}
