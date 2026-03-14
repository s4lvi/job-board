import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "primary" | "accent" | "success" | "danger" | "outline";

const variants: Record<BadgeVariant, string> = {
  default: "bg-white/10 text-white/80",
  primary: "bg-primary/20 text-primary",
  accent: "bg-accent/20 text-accent",
  success: "bg-success/20 text-success",
  danger: "bg-danger/20 text-danger",
  outline: "border border-white/20 text-white/60",
};

export default function Badge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
