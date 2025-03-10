import { NextRequest, NextResponse } from 'next/server';
import { generateOTP, storeOTP } from '@/utils/otp';
import { sendOTPEmail } from '@/utils/email';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Generate a 6-digit OTP
    const otp = generateOTP(6);
    
    // Store the OTP (expires in 10 minutes)
    storeOTP(email, otp, 10);
    
    // Send the OTP via email
    const emailSent = await sendOTPEmail(email, otp);
    
    if (!emailSent) {
      return NextResponse.json(
        { success: false, message: 'Failed to send OTP email' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully'
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
