"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeftRight,
  BookOpen,
  CalendarDays,
  FolderOpen,
  Inbox,
  LayoutDashboard,
  MessageSquare,
  Newspaper,
  ScrollText,
  Share2,
  Stethoscope,
  UserRound,
  Users,
  UsersRound,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS = {
  home: LayoutDashboard,
  children: Users,
  cases: FolderOpen,
  calendar: CalendarDays,
  messages: MessageSquare,
  referrals: Share2,
  programs: BookOpen,
  profile: UserRound,
  users: UsersRound,
  specialists: Stethoscope,
  articles: Newspaper,
  inbox: Inbox,
  audit: ScrollText,
  switch: ArrowLeftRight,
};

export type NavItem = { href: string; label: string; icon: keyof typeof ICONS; exact?: boolean; divider?: boolean };

export function NavLinks({ items, variant = "sidebar" }: { items: NavItem[]; variant?: "sidebar" | "bar" }) {
  const pathname = usePathname();
  const bar = variant === "bar";
  return (
    <nav className={cn(bar ? "flex gap-1 overflow-x-auto px-4 pb-3 [scrollbar-width:none]" : "flex flex-col gap-1")}>
      {items.map((it) => {
        const active = it.exact ? pathname === it.href : pathname === it.href || pathname.startsWith(it.href + "/");
        const Icon = ICONS[it.icon];
        return (
          <Link
            key={it.href}
            href={it.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group relative flex shrink-0 items-center gap-3 rounded-xl text-sm font-medium whitespace-nowrap transition duration-200",
              bar ? "px-3 py-2" : "px-3 py-2.5",
              it.divider && !bar && "mt-4",
              active ? "bg-primary-soft text-primary" : "text-muted hover:bg-surface-2 hover:text-ink",
            )}
          >
            {!bar && (
              <span
                className={cn(
                  "absolute inset-y-2 start-0 w-1 rounded-full bg-primary transition-all duration-300",
                  active ? "opacity-100" : "scale-y-0 opacity-0",
                )}
              />
            )}
            <Icon className={cn("size-[18px] shrink-0 transition-transform duration-200 group-hover:scale-110", active && "text-primary")} />
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
