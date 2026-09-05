# Quran Connect Dashboard

Create a production-ready, highly clean, responsive modular dashboard application for a Quran Academy using React, TypeScript, Vite, and Tailwind CSS. The application must strictly support 3 role-based portals: Admin, Teacher, and Student, operating via an in-memory mock backend system.
 provide a code based  struttcure whih i can link to github later
---

### ARCHITECTURE & CORE SYSTEM CONVENTIONS
1. **Layout & Shell:** Build a unified `DashboardLayout` featuring a responsive left sidebar, top header navbar (`HeaderNavbar.tsx`) with dynamic route breadcrumbs, an auto-detected browser timezone widget (`Intl.DateTimeFormat`), notification badge, user dropdown (Avatar, Name, Role, Profile Link, Logout), and a mobile hamburger menu opening a slide-out drawer navigation.
2. **Navigation Config:** Implement single-source routing via React Router v6 configured in `src/config/navigation.ts` for Admin, Teacher, and Student roles using Lucide icons (`LayoutDashboard`, `Users`, `GraduationCap`, `UserCheck`, `BookOpen`, `Calendar`, `FileText`, `Settings`, `HelpCircle`).
3. **State Management & Mock Data:** 
   - Manage global authentication and mock data state using React Context API (`AuthContext` and `DashboardContext`) without Redux.
   - Self-registration is disabled. All test accounts must be hardcoded on the `/login` screen with role-switcher quick buttons:
     - Admin: admin@quranacademy.com / admin123 -> /admin/dashboard
     - Teacher: teacher@quranacademy.com / teacher123 -> /teacher/dashboard
     - Student: student@quranacademy.com / student123 -> /student/dashboard
   - Support dynamic in-memory state creation for new users created by Admin.
4. **Design System:** Apply Dark and light Mode Default styling using Slate backgrounds (`bg-slate-950`, `bg-slate-900`), Emerald green primary accents (`bg-emerald-600`, `text-emerald-400`), Slate cards (`bg-slate-900/50` with `border-slate-800`), and responsive tables with `overflow-x-auto` or mobile card layouts. an attractive theme style colour can be changed by u but theme should be attractive for light and dark both theme theme styling should be handle only in one index.css file which should be globally using in all file and can be channge or edit lator
5. **Timezone & Live Class Guards:**
   - Automatically detect local browser timezone (`Intl.DateTimeFormat().resolvedOptions().timeZone`) and format all class timings to local time.
   - Shared launcher (`LiveClassCard.tsx`) with real-time countdown timer. "Join Live Class" / "Start Class" buttons must open meeting URLs securely in a new tab (`window.open(url, '_blank', 'noopener,noreferrer')`).
   - Implement a **Class Slot Grace Window**: Activate live class buttons 10 minutes prior to scheduled start time and auto-deactivate 15 minutes post-duration.
   - Implement a **Schedule Conflict Guard**: Prevent assigning overlapping weekly time slots to the same teacher during class scheduling.
6. **UI/UX Polish & Validation:**
   - Include Toast Notifications (using Sonner or Lucide alerts) for all form actions (creating users, saving settings, updating statuses, logging lessons).
   - Provide form validation feedback (inline error messages and field highlights).
   - Implement empty states with fallback illustrations/messages for empty tables and skeleton loaders for async states.
   - Implement pagination controls and search/status filters for data-heavy tables.

---

### ROLE-BASED PORTAL SPECIFICATIONS

#### 1. ADMIN PORTAL
- **Overview (`/admin/dashboard`):** KPI summary cards (Total Trial Requests by status, Pending Inquiries, Active Students/Teachers count, Conversion Rate %), Quick Action shortcuts ("Add Student", "Add Teacher", "Create Course"), and Recent Leads feed.
- **Trial Requests (`/admin/trial-requests`):** Data table (Student Name, Email, WhatsApp Number, Country, Course, Age Group, Preferred Days/Time, Timezone, Status, Actions). Status dropdown (New -> Contacted -> Trial Scheduled -> Trial Completed -> Converted -> Not Interested -> Spam). Quick WhatsApp button launching `https://wa.me/[Phone]?text=[Pre-filled message]`. Slide-out drawer to manage internal follow-up notes.
- **Contact Inquiries (`/admin/contact-inquiries`):** Table with status filters (Pending, Resolved, Spam) and detail drawer with resolution toggle.
- **Student Management (`/admin/students`):** Directory table & "Add New Student" Modal with fields: Full Name, Email, Temporary Password, Country, Local Timezone, Enrolled Course, Assigned Teacher, Weekly Days Selection (Mon-Sun), Class Time Slot (Start Time + Duration), Age Group.
- **Teacher Management (`/admin/teachers`):** Profile cards/table & "Add New Teacher" Modal with fields: Full Name, Email, Temporary Password, Qualifications, Specialization (Tajweed, Hifz, Translation), Phone Number, Base Timezone.
- **Course Management (`/admin/courses`):** Course catalog CRUD with duration, PKR price, USD price, curriculum outline, and active/hidden visibility toggle.
- **Content & FAQs (`/admin/content`):** Testimonials manager CRUD (Name, Country, Rating, Review Text, Published toggle) & FAQ manager CRUD by category (Courses, Pricing, Timings, General).
- **Academy Settings (`/admin/settings`):** Editable academy metadata (Name, Tagline, Email, WhatsApp, Phone, Physical Address, Logo preview, Social links) and Admin personal profile update (Name, Email, Password change modal, Avatar).

#### 2. TEACHER PORTAL
- **Dashboard Overview (`/teacher/dashboard`):** Today's Active Session Banner with current/upcoming class details and prominent "Start / Join Class" button. Quick metrics cards and upcoming daily timetable strip.
- **Class Schedule (`/teacher/schedule`):** Interactive weekly timetable grid (Monday – Sunday) with auto-converted local timezone display and inline meeting link editor to update Google Meet/Zoom URLs per slot.
- **Assigned Students (`/teacher/students`):** Student info cards displaying progress level, age group, weekly days, and a modal to view progress history.
- **Class Logs & Reports (`/teacher/logs`):** Lesson log form with fields: Select Student, Date, Surah/Para Covered, Verses (Ayat) Completed, Tajweed Rating (1-5 Stars), Attendance Status (Present / Absent / Cancelled), Remarks/Homework Notes. Searchable table of past lesson logs.
- **Teacher Profile (`/teacher/profile`):** Edit name, photo upload, qualifications list, specialization, phone, default meeting room link, and Change Password modal.

#### 3. STUDENT PORTAL
- **Learning Dashboard (`/student/dashboard`):** Live Class Hero Banner with assigned teacher avatar, course name, countdown timer, active "Join Live Class" button, current Surah/Para progress card, attendance percentage, last teacher remarks, and academy announcements board.
- **Class Timetable (`/student/schedule`):** Interactive weekly grid auto-adjusted to local detected timezone with attendance history indicators.
- **My Enrolled Courses (`/student/courses`):** Course breakdown, learning objectives, syllabus modules, and downloadable reference resources/guides.
- **Teacher Details (`/student/teacher`):** Assigned teacher bio card, photo, qualifications, experience, and languages spoken.
- **Student Profile (`/student/profile`):** Edit full name, guardian name, email, WhatsApp, country, preferred timezone, and Change Password modal.

---

Ensure all components utilize strongly typed TypeScript interfaces in `src/types/dashboard.ts` backed by comprehensive mock data arrays.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/bc9df44d-f49b-45e0-b712-e47b6ffc8d8e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
