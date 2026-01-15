import { NextResponse } from 'next/server';

export async function GET() {
  // Check if the Google GenAI API key is configured
  const apiKey = process.env.GOOGLE_GENAI_API_KEY;
  
  if (!apiKey || apiKey.trim() === '') {
    return NextResponse.json(
      { error: 'GOOGLE_GENAI_API_KEY is not configured' },
      { status: 400 }
    );
  }
  
  return NextResponse.json({ ok: true });
}
