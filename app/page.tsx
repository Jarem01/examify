import AppShell from '@/components/AppShell';
import { listSets } from '@/lib/store';
import { getProgress } from '@/lib/store';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const [sets, progress] = await Promise.all([listSets(), getProgress()]);
  return <AppShell initialSets={sets} initialProgress={progress} />;
}
