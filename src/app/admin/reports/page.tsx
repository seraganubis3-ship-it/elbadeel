import { requireAdmin } from '@/lib/auth';
import ReportsClient from './ReportsClient';

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
  await requireAdmin();

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6 admin-panel'>
      <div className='max-w-7xl mx-auto'>
        <ReportsClient initialPeriod='30d' />
      </div>
    </div>
  );
}
