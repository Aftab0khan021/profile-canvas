import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactEmailRequest {
  recipient_email: string;
  recipient_name: string;
  sender_name: string;
  sender_email: string;
  message: string;
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { recipient_email, recipient_name, sender_name, sender_email, message }: ContactEmailRequest = await req.json();

    console.log("Sending contact email to:", recipient_email);
    console.log("From:", sender_name, sender_email);

    if (!recipient_email) {
      throw new Error("Recipient email is required");
    }

    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px; }
            .message-box { background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin: 20px 0; }
            .sender-info { background: #eff6ff; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
            .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
            a { color: #3b82f6; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 24px;">📬 New Portfolio Message</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Someone reached out through your FolioX portfolio</p>
            </div>
            <div class="content">
              <div class="sender-info">
                <p style="margin: 0;"><strong>From:</strong> ${sender_name}</p>
                <p style="margin: 5px 0 0 0;"><strong>Email:</strong> <a href="mailto:${sender_email}">${sender_email}</a></p>
              </div>
              <h3 style="margin: 0 0 10px 0;">Message:</h3>
              <div class="message-box">
                <p style="margin: 0; white-space: pre-wrap;">${message}</p>
              </div>
              <p style="margin: 20px 0 0 0;">
                <a href="mailto:${sender_email}?subject=Re: Your message via my portfolio" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500;">
                  Reply to ${sender_name}
                </a>
              </p>
            </div>
            <div class="footer">
              <p>This email was sent from your FolioX portfolio contact form.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "FolioX <onboarding@resend.dev>",
        to: [recipient_email],
        subject: `New message from ${sender_name} via your portfolio`,
        html: emailHtml,
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error("Resend API error:", responseData);
      throw new Error(responseData.message || "Failed to send email");
    }

    console.log("Email sent successfully:", responseData);

    return new Response(JSON.stringify({ success: true, data: responseData }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-contact-email function:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
