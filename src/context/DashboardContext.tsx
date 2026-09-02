import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import {
  ACADEMY_SETTINGS,
  ADMIN_USER,
  ANNOUNCEMENTS,
  CLASS_SLOTS,
  CONTACT_INQUIRIES,
  COURSES,
  FAQS,
  LESSON_LOGS,
  STUDENTS,
  TEACHERS,
  TESTIMONIALS,
  TRIAL_REQUESTS,
} from "@/data/mockData";
import type {
  AcademySettings,
  Announcement,
  ClassSlot,
  ContactInquiry,
  Course,
  Faq,
  LessonLog,
  Student,
  Teacher,
  Testimonial,
  TrialRequest,
  User,
} from "@/types/dashboard";

const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 9)}`;

interface DashboardValue {
  admin: User;
  teachers: Teacher[];
  students: Student[];
  courses: Course[];
  slots: ClassSlot[];
  trialRequests: TrialRequest[];
  inquiries: ContactInquiry[];
  testimonials: Testimonial[];
  faqs: Faq[];
  logs: LessonLog[];
  announcements: Announcement[];
  settings: AcademySettings;
  allUsers: User[];

  addTeacher: (t: Omit<Teacher, "id" | "role">) => Teacher;
  updateTeacher: (id: string, patch: Partial<Teacher>) => void;
  removeTeacher: (id: string) => void;

  addStudent: (s: Omit<Student, "id" | "role">, slots: Omit<ClassSlot, "id" | "studentId">[]) => Student;
  updateStudent: (id: string, patch: Partial<Student>) => void;
  removeStudent: (id: string) => void;

  addSlot: (s: Omit<ClassSlot, "id">) => ClassSlot;
  updateSlot: (id: string, patch: Partial<ClassSlot>) => void;
  removeSlot: (id: string) => void;

  saveCourse: (c: Course) => void;
  removeCourse: (id: string) => void;

  updateTrialRequest: (id: string, patch: Partial<TrialRequest>) => void;
  addTrialNote: (id: string, note: string) => void;
  updateInquiry: (id: string, patch: Partial<ContactInquiry>) => void;

  saveTestimonial: (t: Testimonial) => void;
  removeTestimonial: (id: string) => void;
  saveFaq: (f: Faq) => void;
  removeFaq: (id: string) => void;

  addLog: (l: Omit<LessonLog, "id">) => void;
  updateSettings: (patch: Partial<AcademySettings>) => void;
  updateUser: (id: string, patch: Partial<User>) => void;
}

const DashboardContext = createContext<DashboardValue | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<User>(ADMIN_USER);
  const [teachers, setTeachers] = useState<Teacher[]>(TEACHERS);
  const [students, setStudents] = useState<Student[]>(STUDENTS);
  const [courses, setCourses] = useState<Course[]>(COURSES);
  const [slots, setSlots] = useState<ClassSlot[]>(CLASS_SLOTS);
  const [trialRequests, setTrialRequests] = useState<TrialRequest[]>(TRIAL_REQUESTS);
  const [inquiries, setInquiries] = useState<ContactInquiry[]>(CONTACT_INQUIRIES);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(TESTIMONIALS);
  const [faqs, setFaqs] = useState<Faq[]>(FAQS);
  const [logs, setLogs] = useState<LessonLog[]>(LESSON_LOGS);
  const [announcements] = useState<Announcement[]>(ANNOUNCEMENTS);
  const [settings, setSettings] = useState<AcademySettings>(ACADEMY_SETTINGS);

  const allUsers = useMemo<User[]>(
    () => [admin, ...teachers, ...students],
    [admin, teachers, students],
  );

  const updateUser: DashboardValue["updateUser"] = (id, patch) => {
    const { role: _role, ...rest } = patch;
    if (id === admin.id) setAdmin((a) => ({ ...a, ...rest }));
    setTeachers((ts) => ts.map((t) => (t.id === id ? { ...t, ...rest } : t)));
    setStudents((ss) => ss.map((s) => (s.id === id ? { ...s, ...rest } : s)));
  };

  const value: DashboardValue = {
    admin,
    teachers,
    students,
    courses,
    slots,
    trialRequests,
    inquiries,
    testimonials,
    faqs,
    logs,
    announcements,
    settings,
    allUsers,

    addTeacher: (t) => {
      const teacher: Teacher = { ...t, id: uid("t"), role: "teacher" };
      setTeachers((prev) => [teacher, ...prev]);
      return teacher;
    },
    updateTeacher: (id, patch) => {
      setTeachers((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
    },
    removeTeacher: (id) => setTeachers((prev) => prev.filter((t) => t.id !== id)),

    addStudent: (s, newSlots) => {
      const student: Student = { ...s, id: uid("s"), role: "student" };
      setStudents((prev) => [student, ...prev]);
      setSlots((prev) => [
        ...prev,
        ...newSlots.map((sl) => ({ ...sl, id: uid("cs"), studentId: student.id })),
      ]);
      return student;
    },
    updateStudent: (id, patch) => {
      setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
    },
    removeStudent: (id) => {
      setStudents((prev) => prev.filter((s) => s.id !== id));
      setSlots((prev) => prev.filter((sl) => sl.studentId !== id));
    },

    addSlot: (s) => {
      const slot: ClassSlot = { ...s, id: uid("cs") };
      setSlots((prev) => [...prev, slot]);
      return slot;
    },
    updateSlot: (id, patch) => setSlots((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s))),
    removeSlot: (id) => setSlots((prev) => prev.filter((s) => s.id !== id)),

    saveCourse: (c) =>
      setCourses((prev) =>
        prev.some((x) => x.id === c.id) ? prev.map((x) => (x.id === c.id ? c : x)) : [c, ...prev],
      ),
    removeCourse: (id) => setCourses((prev) => prev.filter((c) => c.id !== id)),

    updateTrialRequest: (id, patch) =>
      setTrialRequests((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t))),
    addTrialNote: (id, note) =>
      setTrialRequests((prev) =>
        prev.map((t) => (t.id === id ? { ...t, notes: [...t.notes, note] } : t)),
      ),
    updateInquiry: (id, patch) =>
      setInquiries((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i))),

    saveTestimonial: (t) =>
      setTestimonials((prev) =>
        prev.some((x) => x.id === t.id) ? prev.map((x) => (x.id === t.id ? t : x)) : [t, ...prev],
      ),
    removeTestimonial: (id) => setTestimonials((prev) => prev.filter((t) => t.id !== id)),
    saveFaq: (f) =>
      setFaqs((prev) =>
        prev.some((x) => x.id === f.id) ? prev.map((x) => (x.id === f.id ? f : x)) : [f, ...prev],
      ),
    removeFaq: (id) => setFaqs((prev) => prev.filter((f) => f.id !== id)),

    addLog: (l) => setLogs((prev) => [{ ...l, id: uid("ll") }, ...prev]),
    updateSettings: (patch) => setSettings((prev) => ({ ...prev, ...patch })),
    updateUser,
  };

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used inside DashboardProvider");
  return ctx;
}

export { uid };
