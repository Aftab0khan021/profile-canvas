import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const RECAPTCHA_SECRET_KEY = Deno.env.get("RECAPTCHA_SECRET_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// H-2: Restrict CORS to known origins only
const ALLOWED_ORIGINS = [
  "https://portfolio-hubs.vercel.app",
  "http://localhost:5173",
  "http://localhost:8080",
];

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("Origin") || "";
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin)
    ? origin
    : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
  };
}

// C-1: HTML-encode user-supplied strings to prevent injection in email body
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// C-1: Validate sender_email is a real email before using in href
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

interface ContactEmailRequest {
  recipient_email: string;
  recipient_name: string;
  sender_name: string;
  sender_email: string;
  message: string;
  recaptcha_token?: string;
}

interface RecaptchaResponse {
  success: boolean;
  score?: number;
  action?: string;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
}

// Verify reCAPTCHA token with Google
async function verifyRecaptcha(token: string): Promise<{ success: boolean; score: number; error?: string }> {
  // FAIL-CLOSED: Block if secret key not configured
  if (!RECAPTCHA_SECRET_KEY) {
    console.error("RECAPTCHA_SECRET_KEY not configured - blocking request");
    return { success: false, score: 0, error: "reCAPTCHA not configured" };
  }

  // FAIL-CLOSED: Block if no token provided
  if (!token) {
    console.error("No reCAPTCHA token provided - blocking request");
    return { success: false, score: 0, error: "reCAPTCHA token required" };
  }

  try {
    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${RECAPTCHA_SECRET_KEY}&response=${token}`,
    });

    const data: RecaptchaResponse = await response.json();

    if (!data.success) {
      console.error("reCAPTCHA verification failed:", data['error-codes']);
      return { success: false, score: 0, error: "reCAPTCHA verification failed" };
    }

    const score = data.score || 0;
    console.log("reCAPTCHA verification successful, score:", score);

    if (score < 0.5) {
      console.warn(`Low reCAPTCHA score (${score}) - blocking request`);
      return { success: false, score, error: "Suspicious activity detected" };
    }

    return { success: true, score };
  } catch (error) {
    // H-5: FAIL-CLOSED — block if reCAPTCHA service is unreachable
    console.error("reCAPTCHA service unavailable - blocking request as a security measure:", error);
    return { success: false, score: 0, error: "Security check temporarily unavailable. Please try again shortly." };
  }
}

// Check and enforce rate limiting
async function checkRateLimit(ip: string, corsHeaders: Record<string, string>): Promise<{ allowed: boolean; remainingTime?: number }> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Clean up old entries first (older than 5 minutes)
  const { error: cleanupError } = await supabase.rpc("cleanup_old_rate_limits");
  if (cleanupError) {
    console.warn("Cleanup function error (non-critical):", cleanupError);
  }

  // Check submissions in the last 120 seconds
  const twoMinutesAgo = new Date(Date.now() - 120000).toISOString();

  const { data: recentSubmissions, error } = await supabase
    .from("rate_limits")
    .select("created_at")
    .eq("ip_address", ip)
    .eq("endpoint", "contact_form")
    .gte("created_at", twoMinutesAgo)
    .order("created_at", { ascending: false });

  if (error) {
    // H-3: FAIL-CLOSED — block if rate limit DB check fails
    console.error("Error checking rate limit — blocking request as fallback:", error);
    return { allowed: false, remainingTime: 60 };
  }

  const submissionCount = recentSubmissions?.length || 0;
  const RATE_LIMIT = 3; // 3 submissions per 120 seconds

  if (submissionCount >= RATE_LIMIT) {
    const oldestSubmission = recentSubmissions[submissionCount - 1];
    const oldestTime = new Date(oldestSubmission.created_at).getTime();
    const remainingTime = Math.ceil((oldestTime + 120000 - Date.now()) / 1000);

    console.log(`Rate limit exceeded for IP ${ip}: ${submissionCount} submissions in last 120s`);
    return { allowed: false, remainingTime: Math.max(remainingTime, 1) };
  }

  // Record this submission
  await supabase.from("rate_limits").insert({
    ip_address: ip,
    endpoint: "contact_form",
  });

  return { allowed: true };
}

serve(async (req: Request): Promise<Response> => {
  const corsHeaders = getCorsHeaders(req);

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      recipient_email,
      recipient_name,
      sender_name,
      sender_email,
      message,
      recaptcha_token
    }: ContactEmailRequest = await req.json();

    // M-2: Server-side input validation and length limits
    if (!sender_name || sender_name.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Sender name is required" }), {
        status: 400, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    if (sender_name.length > 200) {
      return new Response(JSON.stringify({ error: "Name is too long (max 200 characters)" }), {
        status: 400, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    if (!sender_email || !isValidEmail(sender_email)) {
      return new Response(JSON.stringify({ error: "A valid sender email is required" }), {
        status: 400, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    if (!message || message.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    if (message.length > 5000) {
      return new Response(JSON.stringify({ error: "Message is too long (max 5000 characters)" }), {
        status: 400, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!recipient_email) {
      return new Response(JSON.stringify({ error: "Recipient email is required" }), {
        status: 400, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    // Get client IP address
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    console.log("Request from IP:", clientIp);

    // 1. Verify reCAPTCHA token
    const recaptchaResult = await verifyRecaptcha(recaptcha_token || "");
    if (!recaptchaResult.success) {
      console.error("reCAPTCHA verification failed:", recaptchaResult.error);
      return new Response(
        JSON.stringify({
          error: recaptchaResult.error || "Security verification failed. Please try again.",
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // 2. Check rate limiting
    const rateLimitResult = await checkRateLimit(clientIp, corsHeaders);
    if (!rateLimitResult.allowed) {
      console.error(`Rate limit exceeded for IP ${clientIp}`);
      return new Response(
        JSON.stringify({
          error: "rate limit exceeded",
          message: `Too many requests. Please wait ${rateLimitResult.remainingTime} seconds before trying again.`,
          remainingTime: rateLimitResult.remainingTime
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(rateLimitResult.remainingTime || 60),
            ...corsHeaders
          },
        }
      );
    }

    // C-1: HTML-encode all user-supplied values before using in email
    const safeSenderName = escapeHtml(sender_name.trim());
    const safeSenderEmail = escapeHtml(sender_email.trim());
    const safeMessage = escapeHtml(message.trim());
    // Use plain mailto link — only include the email (already validated above)
    const safeMailtoHref = `mailto:${encodeURIComponent(sender_email.trim())}?subject=${encodeURIComponent('Re: Your message via my portfolio')}`;

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
                <p style="margin: 0;"><strong>From:</strong> ${safeSenderName}</p>
                <p style="margin: 5px 0 0 0;"><strong>Email:</strong> <a href="${safeMailtoHref}">${safeSenderEmail}</a></p>
              </div>
              <h3 style="margin: 0 0 10px 0;">Message:</h3>
              <div class="message-box">
                <p style="margin: 0; white-space: pre-wrap;">${safeMessage}</p>
              </div>
              <p style="margin: 20px 0 0 0;">
                <a href="${safeMailtoHref}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500;">
                  Reply to ${safeSenderName}
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
        subject: `New message from ${sender_name.trim()} via your portfolio`,
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