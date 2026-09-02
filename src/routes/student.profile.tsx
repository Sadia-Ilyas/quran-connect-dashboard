import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/ui-kit";
import { ProfileForm } from "@/components/dashboard/ProfileForm";

export const Route = createFileRoute("/student/profile")({
  head: () => ({
    meta: [
      { title: "Student Profile — Quran Academy Portal" },
      {
        name: "description",
        content: "Update your contact details, timezone and password for your Quran classes.",
      },
      { property: "og:title", content: "Student Profile — Quran Academy Portal" },
      { property: "og:description", content: "Manage your student account details." },
    ],
  }),
  component: StudentProfile,
});

function StudentProfile() {
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Profile" description="Keep your details and timezone up to date." />
      <ProfileForm />
    </div>
  );
}
