import { NextResponse } from 'next/server';

export async function POST() {
  // This is a placeholder for development login
  // In a real scenario, you would issue a JWT here
  return NextResponse.json({ 
    message: "google-dev working",
    token: "mock_dev_token",
    user: { id: "dev_user", email: "dev@example.com", name: "Dev User" }
  });
}
