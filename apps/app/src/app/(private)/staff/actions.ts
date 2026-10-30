"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { appUrl } from "@/lib/supabase/env";
import { parisDateTime } from "@/lib/dates";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function optUuid(v: FormDataEntryValue | null): string | null {
  return typeof v === "string" && UUID_RE.test(v) ? v : null;
}

async function requireWriter() {
  const viewer = await requireStaff();
  if (!viewer.isTrainingStaff) redirect("/staff?error=readonly");
  return viewer;
}

// ---------------------------------------------------------------------------
// Enrollment (inscrire un apprenant)
// ---------------------------------------------------------------------------
export async function enrollLearner(formData: FormData) {
  await requireWriter();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const fullName = String(formData.get("full_name") ?? "").trim();
  const courseId = optUuid(formData.get("course_id"));
  const orgId = optUuid(formData.get("organization_id"));
  const cohortId = optUuid(formData.get("cohort_id"));
  if (!EMAIL_RE.test(email) || !courseId) redirect("/staff/inscriptions?error=invalid");

  const supabase = await createClient();
  const enroll = () =>
    supabase.rpc("enroll_by_email", {
      p_email: email,
      p_course: courseId,
      p_organization: orgId,
      p_cohort: cohortId,
    });

  let { error } = await enroll();
  let invited = false;

  if (error?.message.includes("user_not_found")) {
    const admin = createAdminClient();
    if (!admin) redirect("/staff/inscriptions?error=no-account");
    const { error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
      data: fullName ? { full_name: fullName } : undefined,
      redirectTo: `${appUrl()}/auth/callback?next=${encodeURIComponent("/compte?welcome=1")}`,
    });
    if (inviteError) redirect("/staff/inscriptions?error=invite");
    invited = true;
    ({ error } = await enroll());
  }

  if (error) {
    const code = error.message.includes("cohort_course_mismatch") ? "cohort" : "failed";
    redirect(`/staff/inscriptions?error=${code}`);
  }
  revalidatePath("/staff", "layout");
  redirect(`/staff/inscriptions?ok=${invited ? "invited" : "enrolled"}`);
}

export async function setEnrollmentStatus(formData: FormData) {
  await requireWriter();
  const id = optUuid(formData.get("enrollment_id"));
  const status = String(formData.get("status") ?? "");
  if (!id || !["active", "cancelled"].includes(status)) redirect("/staff/inscriptions?error=invalid");
  const supabase = await createClient();
  await supabase.from("enrollments").update({ status }).eq("id", id);
  revalidatePath("/staff", "layout");
  redirect("/staff/inscriptions");
}

// ---------------------------------------------------------------------------
// Cohorts & sessions
// ---------------------------------------------------------------------------
export async function createCohort(formData: FormData) {
  const viewer = await requireWriter();
  const courseId = optUuid(formData.get("course_id"));
  const name = String(formData.get("name") ?? "").trim();
  if (!courseId || name.length < 3) redirect("/staff/sessions?error=invalid");
  const supabase = await createClient();
  const { error } = await supabase.from("cohorts").insert({
    course_id: courseId,
    name,
    organization_id: optUuid(formData.get("organization_id")),
    modality: String(formData.get("modality") ?? "distanciel"),
    location: String(formData.get("location") ?? "").trim() || null,
    start_date: String(formData.get("start_date") ?? "") || null,
    end_date: String(formData.get("end_date") ?? "") || null,
    trainer_id: viewer.staffRole ? viewer.id : null,
  });
  if (error) redirect("/staff/sessions?error=cohort");
  revalidatePath("/staff/sessions");
  redirect("/staff/sessions?ok=cohort");
}

export async function createSession(formData: FormData) {
  const viewer = await requireWriter();
  const cohortId = optUuid(formData.get("cohort_id"));
  const date = String(formData.get("date") ?? "");
  const halfDay = String(formData.get("half_day") ?? "am") === "pm" ? "pm" : "am";
  const start = parisDateTime(date, String(formData.get("start") ?? (halfDay === "am" ? "09:00" : "14:00")));
  const end = parisDateTime(date, String(formData.get("end") ?? (halfDay === "am" ? "12:30" : "17:30")));
  const meetingUrl = String(formData.get("meeting_url") ?? "").trim();
  if (!cohortId || !start || !end || end <= start) redirect("/staff/sessions?error=session");
  if (meetingUrl && !meetingUrl.startsWith("https://")) redirect("/staff/sessions?error=session");

  const supabase = await createClient();
  const { error } = await supabase.from("sessions").insert({
    cohort_id: cohortId,
    title: String(formData.get("title") ?? "").trim() || null,
    starts_at: start,
    ends_at: end,
    half_day: halfDay,
    trainer_id: viewer.id,
    location: String(formData.get("location") ?? "").trim() || null,
    meeting_url: meetingUrl || null,
  });
  if (error) redirect("/staff/sessions?error=session");
  revalidatePath("/staff/sessions");
  redirect("/staff/sessions?ok=session");
}

/** Trainer records / corrects attendance for a learner (status + note). */
export async function recordAttendance(formData: FormData) {
  const viewer = await requireWriter();
  const sessionId = optUuid(formData.get("session_id"));
  const enrollmentId = optUuid(formData.get("enrollment_id"));
  const userId = optUuid(formData.get("user_id"));
  const status = String(formData.get("status") ?? "");
  if (!sessionId || !enrollmentId || !userId || !["present", "absent", "excused"].includes(status)) {
    redirect("/staff/sessions?error=attendance");
  }
  const supabase = await createClient();
  const { error } = await supabase.from("attendance").upsert(
    {
      session_id: sessionId,
      enrollment_id: enrollmentId,
      user_id: userId,
      status,
      recorded_by: viewer.id,
      note: String(formData.get("note") ?? "").trim().slice(0, 500) || null,
    },
    { onConflict: "session_id,user_id" },
  );
  if (error) redirect(`/staff/sessions/${sessionId}?error=1`);
  revalidatePath(`/staff/sessions/${sessionId}`);
  redirect(`/staff/sessions/${sessionId}`);
}

// ---------------------------------------------------------------------------
// Complaints register
// ---------------------------------------------------------------------------
export async function updateComplaint(formData: FormData) {
  const viewer = await requireStaff();
  const id = optUuid(formData.get("complaint_id"));
  const status = String(formData.get("status") ?? "");
  if (!id || !["open", "in_progress", "resolved", "closed"].includes(status)) redirect("/staff/reclamations?error=1");
  const supabase = await createClient();
  const resolved = status === "resolved" || status === "closed";
  const { error } = await supabase
    .from("complaints")
    .update({
      status,
      response: String(formData.get("response") ?? "").trim().slice(0, 5000) || null,
      corrective_action: String(formData.get("corrective_action") ?? "").trim().slice(0, 5000) || null,
      handled_by: viewer.id,
      resolved_at: resolved ? new Date().toISOString() : null,
    })
    .eq("id", id);
  if (error) redirect("/staff/reclamations?error=1");
  revalidatePath("/staff/reclamations");
  redirect("/staff/reclamations?ok=1");
}

export async function issueCertificateForEnrollment(formData: FormData) {
  await requireWriter();
  const id = optUuid(formData.get("enrollment_id"));
  if (!id) redirect("/staff/inscriptions?error=invalid");
  const supabase = await createClient();
  const { error } = await supabase.rpc("issue_certificate", { p_enrollment: id });
  if (error) {
    redirect(`/staff/inscriptions?error=${error.message.includes("missing_learner_name") ? "name" : "certificate"}`);
  }
  revalidatePath("/staff", "layout");
  redirect("/staff/inscriptions?ok=certificate");
}
