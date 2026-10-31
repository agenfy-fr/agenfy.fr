import type { LucideIcon } from "lucide-react";
import {
  Building2,
  FileText,
  FolderKanban,
  Inbox,
  LayoutDashboard,
  ListTodo,
  Magnet,
  Mail,
  Receipt,
  ScrollText,
  Settings,
  Users,
  LifeBuoy,
  FolderOpen,
  GraduationCap,
  KeyRound,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

/** Staff navigation (sidebar + command palette), filtered by ROLE_ACCESS. */
export const navigationGroups: NavGroup[] = [
  {
    label: "Général",
    items: [
      { title: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
      { title: "Messagerie", href: "/mail", icon: Mail },
    ],
  },
  {
    label: "Commercial",
    items: [
      { title: "Leads", href: "/leads", icon: Magnet },
      { title: "Clients", href: "/clients", icon: Building2 },
    ],
  },
  {
    label: "Delivery",
    items: [
      { title: "Projets", href: "/projects", icon: FolderKanban },
      { title: "Tâches", href: "/tasks", icon: ListTodo },
      { title: "Demandes clients", href: "/requests", icon: Inbox },
    ],
  },
  {
    label: "Formation",
    items: [
      { title: "Formations", href: "/training", icon: GraduationCap },
      { title: "Accès formation", href: "/training/access", icon: KeyRound },
    ],
  },
  {
    label: "Facturation",
    items: [
      { title: "Devis", href: "/billing/quotes", icon: ScrollText },
      { title: "Factures", href: "/billing/invoices", icon: Receipt },
    ],
  },
  {
    label: "Administration",
    items: [
      { title: "Équipe", href: "/team", icon: Users },
      { title: "Paramètres", href: "/settings", icon: Settings },
    ],
  },
];

/** Client portal navigation. */
export const portalNavigationGroups: NavGroup[] = [
  {
    label: "Mon espace",
    items: [
      { title: "Accueil", href: "/portal", icon: LayoutDashboard },
      { title: "Projets", href: "/portal/projects", icon: FolderKanban },
      { title: "Documents", href: "/portal/documents", icon: FolderOpen },
      { title: "Factures & devis", href: "/portal/invoices", icon: FileText },
      { title: "Demandes", href: "/portal/requests", icon: LifeBuoy },
    ],
  },
];
