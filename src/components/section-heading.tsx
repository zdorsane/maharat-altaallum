import { cn } from "@/lib/utils";

/** Eyebrow + title + optional lead, shared by every public section. */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  center = false,
  action,
  className,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  center?: boolean;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("reveal mb-12 flex flex-wrap items-end justify-between gap-6", center && "justify-center text-center", className)}>
      <div className={cn("max-w-2xl", center && "mx-auto")}>
        <p className={cn("eyebrow", center && "justify-center")}>
          <span className="h-0.5 w-6 rounded-full bg-sun" aria-hidden />
          {eyebrow}
        </p>
        <h2 className="text-h2 mt-3">{title}</h2>
        {subtitle && <p className="text-lead mt-3 text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
