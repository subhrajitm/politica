import { NextRequest, NextResponse } from 'next/server';
import { autofillPoliticianByName } from '@/ai/flows/autofill-politician';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = String(body?.name || '').trim();
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const data = await autofillPoliticianByName({ name });
    return NextResponse.json({ data }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to autofill' }, { status: 500 });
  }
}


