// In-memory storage for OTPs (in production, use a database)
type OtpRecord = {
    otp: string
    email: string
    createdAt: Date
    expiresAt: Date
  }
  
  // Map to store OTPs with email as key
  const otpStore = new Map<string, OtpRecord>()
  
  // Generate a random OTP
  export function generateOTP(length = 6): string {
    const digits = "0123456789"
    let otp = ""
  
    for (let i = 0; i < length; i++) {
      otp += digits[Math.floor(Math.random() * 10)]
    }
  
    return otp
  }
  
  // Store an OTP for a specific email
  export function storeOTP(email: string, otp: string, expiryMinutes = 10): void {
    const now = new Date()
    const expiresAt = new Date(now.getTime() + expiryMinutes * 60000)
  
    otpStore.set(email.toLowerCase(), {
      otp,
      email: email.toLowerCase(),
      createdAt: now,
      expiresAt,
    })
  }
  
  // Verify an OTP for a specific email
  export function verifyOTP(email: string, otp: string): boolean {
    const record = otpStore.get(email.toLowerCase())
  
    if (!record) {
      return false
    }
  
    // Check if OTP has expired
    if (new Date() > record.expiresAt) {
      otpStore.delete(email.toLowerCase())
      return false
    }
  
    // Check if OTP matches
    const isValid = record.otp === otp
  
    // Remove OTP after verification (one-time use)
    if (isValid) {
      otpStore.delete(email.toLowerCase())
    }
  
    return isValid
  }
  
  