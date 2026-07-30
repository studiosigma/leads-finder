import { NextResponse } from 'next/server';

export async function GET() {
  const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL;
  if (BACKEND_URL && !BACKEND_URL.includes('localhost')) {
    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/leads`);
      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data);
      }
    } catch (e) {
      console.warn('[Next.js API Leads Route] External backend unreachable:', e);
    }
  }

  // Return empty array if standalone / no backend configured
  return NextResponse.json([]);
}
