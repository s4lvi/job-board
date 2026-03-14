import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-black/60">
      {/* Top stripe bars */}
      <div className="flex gap-[3px]">
        <div className="h-[3px] bg-primary flex-1" />
        <div className="h-[3px] bg-primary flex-1" />
        <div className="h-[3px] bg-primary flex-1" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-4 mb-4">
              <Image src="/logo.svg" alt="ACP" width={56} height={47} className="h-12 w-auto" />
              <span className="font-black text-lg uppercase tracking-[0.15em]">
                <span className="text-primary">Jobs</span>
              </span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed max-w-sm">
              The internal job, gig, and bounty board for ACP members. Post opportunities,
              find talent, and get work done with secure escrow payments.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-black text-xs tracking-[0.2em] text-white/80 mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/listings" className="text-white/40 hover:text-primary transition-colors text-sm tracking-wider">
                  Browse Listings
                </Link>
              </li>
              <li>
                <Link href="/listings/create" className="text-white/40 hover:text-primary transition-colors text-sm tracking-wider">
                  Post a Job
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-white/40 hover:text-primary transition-colors text-sm tracking-wider">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-black text-xs tracking-[0.2em] text-white/80 mb-4">
              Support
            </h4>
            <ul className="space-y-2 text-white/40 text-sm tracking-wider">
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  About
                </Link>
              </li>
              <li>support@acpmi.us</li>
              <li>Michigan, USA</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 text-center text-white/20 text-xs uppercase tracking-[0.3em]">
          <p>&copy; {new Date().getFullYear()} ACP Jobs. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
