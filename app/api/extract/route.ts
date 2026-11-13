import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

/** Extract plain text from an uploaded PDF so it can be imported as cards. */
export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }
    if (file.size > 12 * 1024 * 1024) {
      return NextResponse.json({ error: 'Please upload a file under 12 MB.' }, { status: 413 });
    }

    const name = file.name.toLowerCase();
    const buffer = new Uint8Array(await file.arrayBuffer());

    if (name.endsWith('.pdf')) {
      const { extractText, getDocumentProxy } = await import('unpdf');
      const pdf = await getDocumentProxy(buffer);
      const { text } = await extractText(pdf, { mergePages: true });
      const joined = Array.isArray(text) ? text.join('\n') : text;
      return NextResponse.json({ text: joined ?? '', pages: pdf.numPages ?? null });
    }

    const decoded = new TextDecoder('utf-8').decode(buffer);
    return NextResponse.json({ text: decoded, pages: null });
  } catch (error) {
    return NextResponse.json(
      { error: `Could not read that file: ${(error as Error).message}` },
      { status: 422 },
    );
  }
}
