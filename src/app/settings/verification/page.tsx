import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Badge from "@/components/ui/badge";

const verificationTypes = [
  { type: "EMAIL", label: "Email Verification", desc: "Verify your email address", icon: "📧" },
  { type: "PHONE", label: "Phone Verification", desc: "Verify your phone number", icon: "📱" },
  { type: "ORGANIZATION", label: "Organization", desc: "Verify your organization membership", icon: "🏢" },
  { type: "IDENTITY", label: "Identity", desc: "Verify your identity with a government ID", icon: "🪪" },
] as const;

export default async function VerificationPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const verifications = await prisma.verification.findMany({
    where: { userId: session.user.id },
  });

  const verificationMap = new Map(verifications.map((v) => [v.type, v]));

  return (
    <div>
      <h2 className="text-lg mb-6">Verification</h2>
      <p className="text-white/40 text-sm mb-8">
        Verified accounts build trust and get more responses.
      </p>

      <div className="space-y-4">
        {verificationTypes.map((vt) => {
          const verification = verificationMap.get(vt.type);
          const isVerified = verification?.verified;

          return (
            <div key={vt.type} className="border border-white/5 bg-surface p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-2xl">{vt.icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold">{vt.label}</h3>
                    {isVerified ? (
                      <Badge variant="success">Verified</Badge>
                    ) : verification ? (
                      <Badge variant="accent">Pending</Badge>
                    ) : null}
                  </div>
                  <p className="text-white/40 text-xs">{vt.desc}</p>
                </div>
              </div>
              {!isVerified && (
                <button className="btn-secondary btn-sm" disabled={!!verification}>
                  {verification ? "Pending Review" : "Verify"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
