import { NextResponse } from 'next/server';
import { createSet, listSets } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sets = await listSets();
    return NextResponse.json({ sets });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const terms = Array.isArray(body?.terms) ? body.terms : [];
    if (terms.length === 0) {
      return NextResponse.json({ error: 'A study set needs at least one card.' }, { status: 400 });
    }
    const set = await createSet({
      title: typeof body.title === 'string' ? body.title : 'Untitled study set',
      description: typeof body.description === 'string' ? body.description : '',
      subject: typeof body.subject === 'string' ? body.subject : '',
      terms,
    });
    return NextResponse.json({ set }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
