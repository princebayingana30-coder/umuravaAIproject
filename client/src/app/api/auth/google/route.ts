import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { token, tokenType } = await req.json();
    
    // This is a placeholder for Google OAuth verification
    // In a real scenario, you would verify the Google token and issue a local JWT
    
    return NextResponse.json({ 
      message: "google login working",
      token: "mock_google_token",
      user: { id: "google_user", email: "user@gmail.com", name: "Google User" }
    });
  } catch (error) {
    return NextResponse.json({ error: "Auth error" }, { status: 400 });
  }
}
