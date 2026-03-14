import { cn, getInitials } from "@/lib/utils";
import Image from "next/image";

export default function Avatar({
  src,
  name,
  size = "md",
  className,
}: {
  src?: string | null;
  name?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizes = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-16 h-16 text-lg" };
  const imgSizes = { sm: 32, md: 40, lg: 64 };

  if (src) {
    return (
      <Image
        src={src}
        alt={name || "User"}
        width={imgSizes[size]}
        height={imgSizes[size]}
        className={cn("rounded-full object-cover", sizes[size], className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-full bg-primary/20 text-primary font-black uppercase flex items-center justify-center",
        sizes[size],
        className
      )}
    >
      {name ? getInitials(name) : "?"}
    </div>
  );
}
