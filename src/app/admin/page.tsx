import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

export default async function AdminDashboard() {
  const [totalUsers, totalListings, activeListings, totalContracts, completedContracts, totalRevenue] =
    await Promise.all([
      prisma.user.count(),
      prisma.listing.count(),
      prisma.listing.count({ where: { status: "ACTIVE" } }),
      prisma.contract.count(),
      prisma.contract.count({ where: { status: "COMPLETED" } }),
      prisma.contract.aggregate({
        where: { status: "COMPLETED" },
        _sum: { platformFee: true },
      }),
    ]);

  const recentUsers = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  const stats = [
    { label: "Total Users", value: totalUsers },
    { label: "Total Listings", value: totalListings },
    { label: "Active Listings", value: activeListings },
    { label: "Total Contracts", value: totalContracts },
    { label: "Completed", value: completedContracts },
    { label: "Platform Revenue", value: formatCurrency(Number(totalRevenue._sum.platformFee || 0)) },
  ];

  return (
    <div>
      <h1 className="text-2xl md:text-3xl mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {stats.map((stat) => (
          <div key={stat.label} className="border border-white/5 bg-surface p-5 card-cut">
            <div className="text-2xl font-black text-primary">{stat.value}</div>
            <div className="text-[10px] text-white/40 uppercase tracking-[0.2em] mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <h2 className="text-sm mb-4">Recent Users</h2>
      <div className="border border-white/5 bg-surface overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white/40">Name</th>
              <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white/40">Email</th>
              <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white/40">Role</th>
              <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white/40">Joined</th>
            </tr>
          </thead>
          <tbody>
            {recentUsers.map((user) => (
              <tr key={user.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="px-4 py-3 font-bold">{user.name || "—"}</td>
                <td className="px-4 py-3 text-white/50">{user.email}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${
                    user.role === "ADMIN" ? "text-primary" :
                    user.role === "POSTER" ? "text-accent" : "text-white/50"
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-white/30">{user.createdAt.toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
