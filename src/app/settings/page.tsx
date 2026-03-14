import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

async function updateProfile(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) return;

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: formData.get("name") as string,
      title: (formData.get("title") as string) || null,
      location: (formData.get("location") as string) || null,
      bio: (formData.get("bio") as string) || null,
    },
  });

  revalidatePath("/settings");
}

export default async function ProfileSettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) redirect("/auth/login");

  return (
    <div>
      <h2 className="text-lg mb-6">Profile</h2>

      <form action={updateProfile} className="space-y-5">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-white/60 block mb-2">
            Full Name
          </label>
          <input
            type="text"
            name="name"
            defaultValue={user.name || ""}
            className="input-field"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-white/60 block mb-2">
            Title / Role
          </label>
          <input
            type="text"
            name="title"
            defaultValue={user.title || ""}
            className="input-field"
            placeholder="e.g. Full Stack Developer"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-white/60 block mb-2">
            Location
          </label>
          <input
            type="text"
            name="location"
            defaultValue={user.location || ""}
            className="input-field"
            placeholder="e.g. Detroit, MI"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-white/60 block mb-2">
            Bio
          </label>
          <textarea
            name="bio"
            defaultValue={user.bio || ""}
            rows={5}
            className="input-field resize-none"
            placeholder="Tell others about yourself..."
          />
        </div>

        <button type="submit" className="btn-primary">
          Save Changes
        </button>
      </form>
    </div>
  );
}
