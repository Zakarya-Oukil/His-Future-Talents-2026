import { NextResponse } from "next/server";
import { isAdmin, unauthorized } from "@/lib/adminAuth";
import {
  getStudentApplications,
  saveStudentApplication,
  updateStudentApplicationStatus,
  deleteStudentApplication,
  findStudentApplication,
} from "@/lib/dataStore";
import { sendStudentApprovalEmail } from "@/lib/mailer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Public "resend my badge": one email per student per cooldown window (admins are exempt).
// ponytail: in-memory, resets on deploy and assumes a single replica; move to DB if the app scales out.
const RESEND_COOLDOWN_MS = 2 * 60 * 1000;
const lastResendAt = new Map<string, number>();

// Fields safe to show on the public /verify page
const PUBLIC_FIELDS = ["id", "badgeId", "firstName", "lastName", "fieldOfStudyOrWork", "studyLevel", "university", "status"] as const;

export async function GET(req: Request) {
  if (!isAdmin(req)) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id") || "";
    const code = searchParams.get("code") || "";
    if (!id && !code) return unauthorized();
    const match = await findStudentApplication(id, code);
    const data = match ? [Object.fromEntries(PUBLIC_FIELDS.map((k) => [k, (match as any)[k]]))] : [];
    return NextResponse.json({ success: true, data });
  }
  try {
    const localStudents = await getStudentApplications();

    let liveStudents: any[] = [];
    try {
      const liveRes = await fetch("https://hisfuturetalent.his.edu.dz/api/students", {
        next: { revalidate: 0 },
        signal: AbortSignal.timeout(3000),
      });
      if (liveRes.ok) {
        const liveJson = await liveRes.json();
        if (liveJson.success && Array.isArray(liveJson.data)) {
          liveStudents = liveJson.data;
        }
      }
    } catch (liveErr) {
      // offline fallback
    }

    const studentMap = new Map<string, any>();
    for (const s of liveStudents) {
      const key = `${s.email?.toLowerCase()?.trim() || s.id}`;
      studentMap.set(key, s);
    }
    for (const s of localStudents) {
      const key = `${s.email?.toLowerCase()?.trim() || s.id}`;
      if (!studentMap.has(key)) {
        studentMap.set(key, s);
      }
    }

    return NextResponse.json({ success: true, data: Array.from(studentMap.values()) });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch student applications" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      wilaya,
      ageCategory,
      currentStatus,
      fieldOfStudyOrWork,
      university,
      studyLevel,
      cvUrl,
      cvFileName,
      seekingObjectives,
      interestedFields,
      interestedCompanies,
      interests,
      howDidYouHear,
      additionalComments,
      consentDataProtection,
      consentCvSharing,
      autoApprove,
    } = body;

    // Required fields: Full Name, Email, Phone, Age Category, Current Status, Field of Study/Work, Interested Fields.
    // CV upload is optional and not required for registration.
    if (!firstName || !email || !phone || !ageCategory || !currentStatus || !fieldOfStudyOrWork) {
      return NextResponse.json(
        { success: false, error: "Please fill in all required fields (*)." },
        { status: 400 }
      );
    }

    const application = await saveStudentApplication({
      firstName: String(firstName).trim(),
      lastName: String(lastName || "").trim(),
      email: String(email).trim().toLowerCase(),
      phone: String(phone).trim(),
      wilaya: wilaya ? String(wilaya).trim() : "",
      ageCategory: String(ageCategory).trim(),
      currentStatus: String(currentStatus).trim(),
      fieldOfStudyOrWork: String(fieldOfStudyOrWork).trim(),
      university: university ? String(university).trim() : String(fieldOfStudyOrWork).trim(),
      studyLevel: studyLevel ? String(studyLevel).trim() : String(currentStatus).trim(),
      cvUrl: cvUrl ? String(cvUrl).trim() : "",
      cvFileName: cvFileName ? String(cvFileName).trim() : "",
      seekingObjectives: Array.isArray(seekingObjectives) ? seekingObjectives : [],
      interestedFields: Array.isArray(interestedFields) ? interestedFields : [],
      interestedCompanies: Array.isArray(interestedCompanies) ? interestedCompanies : [],
      interests: Array.isArray(interests) ? interests : [],
      howDidYouHear: howDidYouHear ? String(howDidYouHear).trim() : "",
      additionalComments: additionalComments ? String(additionalComments).trim() : "",
      consentDataProtection: Boolean(consentDataProtection),
      consentCvSharing: Boolean(consentCvSharing),
    });

    // Automatically confirm registration and send the official pass badge PDF via email
    await updateStudentApplicationStatus(application.id, "Confirmé");
    application.status = "Confirmé";
    sendStudentApprovalEmail(application).catch((err) =>
      console.error("Student registration email dispatch error:", err)
    );

    return NextResponse.json({ success: true, data: application, emailDispatched: true });
  } catch (error: any) {
    console.error("Error in POST /api/students:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to save student application" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status, action, resendEmail } = body;

    // Only "resend my badge" is public (used by StudentBadge after registration); everything else is admin-only
    if (!(action === "resend_email" || resendEmail) && !isAdmin(req)) return unauthorized();

    if (action === "delete") {
      const deleted = await deleteStudentApplication(id);
      return NextResponse.json({ success: deleted });
    }

    // Action to resend approval email manually
    if (action === "resend_email" || resendEmail) {
      const student = id ? await findStudentApplication(String(id), "") : undefined;
      if (!student) {
        return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 });
      }

      if (!isAdmin(req)) {
        const last = lastResendAt.get(student.id) || 0;
        if (Date.now() - last < RESEND_COOLDOWN_MS) {
          return NextResponse.json(
            { success: false, error: "Badge was just sent. Please check your inbox (and spam) and try again in 2 minutes." },
            { status: 429 }
          );
        }
        lastResendAt.set(student.id, Date.now());
      }

      const emailResult = await sendStudentApprovalEmail(student);
      return NextResponse.json({
        success: true,
        emailSent: emailResult.success,
        emailResult,
      });
    }

    if (!id || !status) {
      return NextResponse.json({ success: false, error: "ID and status are required" }, { status: 400 });
    }

    const updated = await updateStudentApplicationStatus(id, status);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Student application not found" }, { status: 404 });
    }

    let emailResult = null;

    // Automatically send official badge email when status is set to 'Confirmé'
    if (status === "Confirmé") {
      try {
        emailResult = await sendStudentApprovalEmail(updated);
        console.log(`Approval email triggered for student ${updated.id}:`, emailResult);
      } catch (err: any) {
        console.error("Non-blocking error dispatching student approval email:", err);
        emailResult = { success: false, error: err?.message };
      }
    }

    return NextResponse.json({
      success: true,
      data: updated,
      emailSent: emailResult?.success ?? false,
      emailResult,
    });
  } catch (error: any) {
    console.error("Error in PATCH /api/students:", error);
    return NextResponse.json({ success: false, error: "Failed to update student application" }, { status: 500 });
  }
}

