import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY || "";

export const resend = apiKey ? new Resend(apiKey) : null;

export interface EmailInquiry {
  name: string;
  email: string;
  company: string;
  city: string;
  startDate: string;
  duration: string;
  guests: number;
  requirements?: string;
}

export async function sendInquiryEmail(inquiry: EmailInquiry): Promise<{ success: boolean; error?: string }> {
  const emailHtml = `
    <h1>New Corporate Housing Inquiry</h1>
    <p><strong>Full Name:</strong> ${inquiry.name}</p>
    <p><strong>Work Email:</strong> ${inquiry.email}</p>
    <p><strong>Company:</strong> ${inquiry.company}</p>
    <p><strong>Target City:</strong> ${inquiry.city}</p>
    <p><strong>Estimated Start Date:</strong> ${inquiry.startDate}</p>
    <p><strong>Estimated Duration:</strong> ${inquiry.duration}</p>
    <p><strong>Number of Guests/Units:</strong> ${inquiry.guests}</p>
    <p><strong>Additional Requirements:</strong></p>
    <blockquote style="background: #f3f4f6; padding: 10px; border-left: 4px solid #1b3022;">
      ${inquiry.requirements || "None provided"}
    </blockquote>
  `;

  if (resend) {
    try {
      const response = await resend.emails.send({
        from: "StayAlberta Inquiry <onboarding@resend.dev>",
        to: "hrodricestate@gmail.com",
        subject: `New StayAlberta Inquiry - ${inquiry.company} (${inquiry.city})`,
        html: emailHtml,
      });

      if (response.error) {
        return { success: false, error: response.error.message };
      }
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error?.message || "An unknown error occurred while sending." };
    }
  }

  // Developer mock mode logs the lead directly
  console.log("----------------------------------------");
  console.log("MOCK MODE: Resend API Key is missing.");
  console.log("Inquiry logged to console below:");
  console.log(JSON.stringify(inquiry, null, 2));
  console.log("HTML Body Preview:\n", emailHtml);
  console.log("----------------------------------------");

  // Simulate server latency
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return { success: true };
}
