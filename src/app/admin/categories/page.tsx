import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import Badge from "@/components/ui/badge";

async function addCategory(formData: FormData) {
  "use server";
  const name = formData.get("name") as string;
  if (!name) return;
  const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
  await prisma.category.create({ data: { name, slug } });
  revalidatePath("/admin/categories");
}

async function deleteCategory(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
}

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { listings: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <h1 className="text-2xl mb-8">Category Management</h1>

      <form action={addCategory} className="flex gap-3 mb-8">
        <input
          type="text"
          name="name"
          placeholder="Category name"
          required
          className="input-field flex-1"
        />
        <button type="submit" className="btn-primary btn-sm">
          Add Category
        </button>
      </form>

      <div className="space-y-2">
        {categories.map((cat) => (
          <div key={cat.id} className="border border-white/5 bg-surface p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-bold text-sm">{cat.name}</span>
              <Badge variant="outline">{cat.slug}</Badge>
              <span className="text-[10px] text-white/30">{cat._count.listings} listings</span>
            </div>
            <form action={deleteCategory}>
              <input type="hidden" name="id" value={cat.id} />
              <button type="submit" className="text-danger text-xs font-bold hover:underline">
                Delete
              </button>
            </form>
          </div>
        ))}
        {categories.length === 0 && (
          <p className="text-white/30 text-sm text-center py-8">No categories yet</p>
        )}
      </div>
    </div>
  );
}
