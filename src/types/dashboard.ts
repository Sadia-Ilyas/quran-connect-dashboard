export type Role = "admin" | "teacher" | "student";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  avatarUrl?: string;
  timezone: string;
  country?: string;
  phone?: string;
}

export interface Teacher extends User {
  role: "teacher";
  qualifications: string[];
  specialization: Specialization[];
  experienceYears: number;
  languages: string[];
  bio: string;
  defaultMeetingUrl: string;
}

export type Specialization = "Tajweed" | "Hifz" | "Translation" | "Qaida" | "Arabic";

export type AgeGroup = "Kids (5-12)" | "Teens (13-17)" | "Adults (18+)";

export interface Student extends User {
  role: "student";
  guardianName?: string;
  whatsapp?: string;
  courseId: string;
  teacherId: string;
  ageGroup: AgeGroup;
  level: string;
  attendancePercent: number;
  currentSurah: string;
  currentPara: string;
  joinedAt: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  durationWeeks: number;
  pricePKR: number;
  priceUSD: number;
  curriculum: string[];
  objectives: string[];
  resources: { label: string; url: string }[];
  visible: boolean;
}

/** dayOfWeek: 0 = Sunday ... 6 = Saturday. startUtc is "HH:mm" in UTC. */
export interface ClassSlot {
  id: string;
  studentId: string;
  teacherId: string;
  courseId: string;
  dayOfWeek: number;
  startUtc: string;
  durationMinutes: number;
  meetingUrl: string;
}

export type TrialStatus =
  | "New"
  | "Contacted"
  | "Trial Scheduled"
  | "Trial Completed"
  | "Converted"
  | "Not Interested"
  | "Spam";

export interface TrialRequest {
  id: string;
  studentName: string;
  email: string;
  whatsapp: string;
  country: string;
  course: string;
  ageGroup: AgeGroup;
  preferredDays: string[];
  preferredTime: string;
  timezone: string;
  status: TrialStatus;
  notes: string[];
  createdAt: string;
}

export type InquiryStatus = "Pending" | "Resolved" | "Spam";

export interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: InquiryStatus;
  createdAt: string;
}

export interface Testimonial {
  id: string;
  name: string;
  country: string;
  rating: number;
  review: string;
  published: boolean;
}

export type FaqCategory = "Courses" | "Pricing" | "Timings" | "General";

export interface Faq {
  id: string;
  category: FaqCategory;
  question: string;
  answer: string;
}

export type AttendanceStatus = "Present" | "Absent" | "Cancelled";

export interface LessonLog {
  id: string;
  studentId: string;
  teacherId: string;
  date: string;
  surahOrPara: string;
  versesCompleted: number;
  tajweedRating: number;
  attendance: AttendanceStatus;
  remarks: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  date: string;
}

export interface AcademySettings {
  name: string;
  tagline: string;
  email: string;
  whatsapp: string;
  phone: string;
  address: string;
  logoUrl: string;
  facebook: string;
  instagram: string;
  youtube: string;
}
