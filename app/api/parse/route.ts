import { NextResponse } from 'next/server';
import { parseCards, parseProseCards } from '@/lib/parse';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const text = typeof body?.text === 'string' ? body.text : '';
    if (body?.mode === 'prose') {
      return NextResponse.json(parseProseCards(text));
    }
    const result = parseCards(text, {
      termDelimiter: body?.termDelimiter ?? 'tab',
      cardDelimiter: body?.cardDelimiter ?? 'newline',
      customTermDelimiter: body?.customTermDelimiter,
      customCardDelimiter: body?.customCardDelimiter,
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
