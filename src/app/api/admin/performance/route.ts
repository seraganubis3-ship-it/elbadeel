import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { dbMonitor, checkDatabaseHealth } from '@/lib/databaseMonitor';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await requireAuth();

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'overview';

    switch (type) {
      case 'overview':
        return getPerformanceOverview();
      case 'queries':
        return getQueryStats();
      case 'health':
        return getDatabaseHealth();
      case 'indexes':
        return getIndexStats();
      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }
  } catch (error) {
    //
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function getPerformanceOverview() {
  const [dbStats, healthCheck] = await Promise.all([
    dbMonitor.getDatabaseStats(),
    checkDatabaseHealth(),
  ]);

  return NextResponse.json({
    database: dbStats,
    health: healthCheck,
    timestamp: new Date().toISOString(),
  });
}

async function getQueryStats() {
  const [slowQueries, trends] = await Promise.all([
    dbMonitor.getSlowQueries(20),
    dbMonitor.getQueryTrends(24),
  ]);

  return NextResponse.json({
    slowQueries,
    trends,
    timestamp: new Date().toISOString(),
  });
}

async function getDatabaseHealth() {
  const healthCheck = await checkDatabaseHealth();

  return NextResponse.json({
    ...healthCheck,
    timestamp: new Date().toISOString(),
  });
}

async function getIndexStats() {
  try {
    const indexStats = await prisma.$queryRaw`
      SELECT 
        schemaname,
        tablename,
        indexname,
        indexdef,
        pg_size_pretty(pg_relation_size(indexname::regclass)) as size
      FROM pg_indexes 
      WHERE schemaname = 'public' 
      AND indexname LIKE 'idx_%'
      ORDER BY tablename, indexname;
    `;

    const tableStats = await prisma.$queryRaw`
      SELECT 
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
        pg_stat_get_tuples_returned(c.oid) as tuples_returned,
        pg_stat_get_tuples_fetched(c.oid) as tuples_fetched
      FROM pg_tables t
      JOIN pg_class c ON c.relname = t.tablename
      WHERE schemaname = 'public'
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
    `;

    return NextResponse.json({
      indexes: indexStats,
      tables: tableStats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    //
    return NextResponse.json({ error: 'Failed to get index statistics' }, { status: 500 });
  }
}
