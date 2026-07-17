import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    firebaseProjectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    hasFirebaseKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    env: process.env.NODE_ENV,
  });
}