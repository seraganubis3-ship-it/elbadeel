// API endpoint to check job status
import { NextRequest, NextResponse } from 'next/server';
import { getJobStatus, getQueueStats, QUEUE_NAMES } from '@/lib/queue/queues';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const jobId = searchParams.get('jobId');
    const queueName = searchParams.get('queue');
    const action = searchParams.get('action');

    // Get queue statistics
    if (action === 'stats' && queueName) {
      const stats = await getQueueStats(queueName);
      return NextResponse.json({ success: true, stats });
    }

    // Get all queue stats
    if (action === 'stats' && !queueName) {
      const allStats = await Promise.all(
        Object.values(QUEUE_NAMES).map(async name => ({
          queue: name,
          stats: await getQueueStats(name),
        }))
      );
      return NextResponse.json({ success: true, queues: allStats });
    }

    // Get specific job status
    if (jobId && queueName) {
      const status = await getJobStatus(queueName, jobId);
      return NextResponse.json({ success: true, job: status });
    }

    return NextResponse.json(
      { success: false, error: 'Missing required parameters' },
      { status: 400 }
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Queue status error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get queue status' },
      { status: 500 }
    );
  }
}
