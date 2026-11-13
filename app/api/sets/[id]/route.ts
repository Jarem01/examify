import { NextResponse } from 'next/server';
import { deleteSet, getSet, updateSet } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const set = await getSet(id);
  if (!set) return NextResponse.json({ error: 'Set not found' }, { status: 404 });
  return NextResponse.json({ set });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const set = await updateSet(id, body);
    if (!set) return NextResponse.json({ error: 'Set not found' }, { status: 404 });
    return NextResponse.json({ set });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const deleted = await deleteSet(id);
  if (!deleted) return NextResponse.json({ error: 'Set not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
