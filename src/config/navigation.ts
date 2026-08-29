import {
  LayoutDashboard,
  Users,
  GraduationCap,
  UserCheck,
  BookOpen,
  Calendar,
  FileText,
  Settings,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@/types/dashboard";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
}

export const NAVIGATION: Record<Role, NavItem[]> = {
  admin: [
    { label: "Overview", to: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Trial Requests", to: "/admin/trial-requests", icon: UserCheck },
    { label: "Contact Inquiries", to: "/admin/contact-inquiries", icon: HelpCircle },
    { label: "Students", to: "/admin/students", icon: Users },
    { label: "Teachers", to: "/admin/teachers", icon: GraduationCap },
    { label: "Courses", to: "/admin/courses", icon: BookOpen },
    { label: "Content & FAQs", to: "/admin/content", icon: FileText },
    { label: "Academy Settings", to: "/admin/settings", icon: Settings },
  ],
  teacher: [
    { label: "Overview", to: "/teacher/dashboard", icon: LayoutDashboard },
    { label: "Class Schedule", to: "/teacher/schedule", icon: Calendar },
    { label: "My Students", to: "/teacher/students", icon: Users },
    { label: "Class Logs", to: "/teacher/logs", icon: FileText },
    { label: "Profile", to: "/teacher/profile", icon: Settings },
  ],
  student: [
    { label: "Dashboard", to: "/student/dashboard", icon: LayoutDashboard },
    { label: "Timetable", to: "/student/schedule", icon: Calendar },
    { label: "My Courses", to: "/student/courses", icon: BookOpen },
    { label: "My Teacher", to: "/student/teacher", icon: GraduationCap },
    { label: "Profile", to: "/student/profile", icon: Settings },
  ],
};

export const HOME_ROUTE: Record<Role, string> = {
  admin: "/admin/dashboard",
  teacher: "/teacher/dashboard",
  student: "/student/dashboard",
};
