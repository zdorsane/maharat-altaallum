import type { Dict } from "./i18n/dictionaries/ar";
import type { Role } from "./constants";
import type { NavItem } from "@/components/nav-links";

export type Area = "parent" | "review" | "specialist" | "admin";

export const areaOf = (role: Role): Area =>
  role === "PARENT" ? "parent" : role === "SPECIALIST" ? "specialist" : role === "REVIEWER" ? "review" : "admin";

export function navFor(area: Area, role: Role, t: Dict): NavItem[] {
  switch (area) {
    case "parent": {
      const n = t.navs.parent;
      return [
        { href: "/parent", label: n.home, icon: "home", exact: true },
        { href: "/parent/children", label: n.children, icon: "children" },
        { href: "/parent/cases", label: n.cases, icon: "cases" },
        { href: "/parent/appointments", label: n.appointments, icon: "calendar" },
        { href: "/parent/messages", label: n.messages, icon: "messages" },
        { href: "/parent/account", label: n.account, icon: "profile" },
      ];
    }
    case "specialist": {
      const n = t.navs.specialist;
      return [
        { href: "/specialist", label: n.home, icon: "home", exact: true },
        { href: "/specialist/cases", label: n.cases, icon: "cases" },
        { href: "/specialist/appointments", label: n.appointments, icon: "calendar" },
        { href: "/specialist/programs", label: n.programs, icon: "programs" },
        { href: "/specialist/messages", label: n.messages, icon: "messages" },
        { href: "/specialist/profile", label: n.profile, icon: "profile" },
      ];
    }
    case "review": {
      const n = t.navs.review;
      const items: NavItem[] = [
        { href: "/review", label: n.dashboard, icon: "home", exact: true },
        { href: "/review/cases", label: n.cases, icon: "cases" },
        { href: "/review/referrals", label: n.referrals, icon: "referrals" },
        { href: "/review/messages", label: n.messages, icon: "messages" },
      ];
      if (role !== "REVIEWER") items.push({ href: "/admin", label: n.toAdmin, icon: "switch", divider: true });
      return items;
    }
    case "admin": {
      const n = t.navs.admin;
      return [
        { href: "/admin", label: n.overview, icon: "home", exact: true },
        { href: "/admin/users", label: n.users, icon: "users" },
        { href: "/admin/specialists", label: n.specialists, icon: "specialists" },
        { href: "/admin/programs", label: n.programs, icon: "programs" },
        { href: "/admin/articles", label: n.articles, icon: "articles" },
        { href: "/admin/contact", label: n.contact, icon: "inbox" },
        { href: "/admin/audit", label: n.audit, icon: "audit" },
        { href: "/review", label: n.toReview, icon: "switch", divider: true },
      ];
    }
  }
}
