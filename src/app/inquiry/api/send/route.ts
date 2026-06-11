import { NextResponse } from "next/server";
import { sendInquiryEmail, EmailInquiry } from "@/lib/resend";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { name, email, company, city, startDate, duration, guests, requirements } = body;
    if (!name || !email || !company || !city) {
      return NextResponse.json(
        { success: false, error: "Missing required contact details (name, email, company, city)." },
        { status: 400 }
      );
    }

    const inquiry: EmailInquiry = {
      name,
      email,
      company,
      city,
      startDate: startDate || "Not specified",
      duration: duration || "2-4weeks",
      guests: Number(guests) || 1,
      requirements: requirements || "",
    };

    const result = await sendInquiryEmail(inquiry);

    if (result.success) {
      return NextResponse.json({ success: true, message: "Inquiry submitted successfully." });
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
