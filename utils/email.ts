import nodemailer from "nodemailer"

// Create a transporter using environment variables
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number.parseInt(process.env.EMAIL_SERVER_PORT || "587"),
  secure: Number.parseInt(process.env.EMAIL_SERVER_PORT || "587") === 465, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
})

// Function to send an email with OTP
export async function sendOTPEmail(to: string, otp: string): Promise<boolean> {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject: "Your LegalAI Login OTP",
      text: `Your one-time password is: ${otp}. It will expire in 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #4f46e5;">LegalAI</h1>
          </div>
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
            <h2 style="margin-top: 0; color: #111827;">Your Login Code</h2>
            <p style="margin-bottom: 10px; color: #4b5563;">Use the following one-time password to log in to your LegalAI account:</p>
            <div style="background-color: #ffffff; padding: 15px; border-radius: 5px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold; color: #4f46e5; border: 1px dashed #4f46e5;">
              ${otp}
            </div>
            <p style="margin-top: 15px; color: #4b5563;">This code will expire in 10 minutes.</p>
          </div>
          <div style="color: #6b7280; font-size: 14px; text-align: center;">
            <p>If you didn't request this code, you can safely ignore this email.</p>
          </div>
        </div>
      `,
    })

    console.log("Email sent: %s", info.messageId)
    return true
  } catch (error) {
    console.error("Error sending email:", error)
    return false
  }
}

