import { NextResponse } from 'next/server';
import { getProgress, recordProgress } from '@/lib/store';
import type { TermProgress } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const progress = await getProgress();
  return NextResponse.json({ progress });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (typeof body?.setId !== 'string' || !body.setId) {
      return NextResponse.json({ error: 'setId is required' }, { status: 400 });
    }
    const terms =
      body.terms && typeof body.terms === 'object' ? (body.terms as Record<string, TermProgress>) : undefined;
    const progress = await recordProgress({
      setId: body.setId,
      terms,
      answeredDelta: Number(body.answeredDelta) || 0,
      correctDelta: Number(body.correctDelta) || 0,
      missedDelta: Number(body.missedDelta) || 0,
    });
    return NextResponse.json({ progress });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
