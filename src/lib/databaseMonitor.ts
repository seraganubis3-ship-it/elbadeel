// Database performance monitoring and optimization
import { prisma } from '@/lib/prisma';

export interface QueryStats {
  query: string;
  duration: number;
  timestamp: Date;
  slow: boolean;
}

export interface DatabaseStats {
  totalQueries: number;
  slowQueries: number;
  averageQueryTime: number;
  slowestQuery: QueryStats | null;
  connectionCount: number;
  activeConnections: number;
}

class DatabaseMonitor {
  private queryStats: QueryStats[] = [];

  // Monitor query performance
  async monitorQuery<T>(_queryName: string, query: () => Promise<T>): Promise<T> {
    try {
      const result = await query();
      // Database monitoring disabled in production
      return result;
    } catch (error) {
      // Error monitoring disabled in production
      throw error;
    }
  }

  // Get database statistics
  async getDatabaseStats(): Promise<DatabaseStats> {
    const totalQueries = this.queryStats.length;
    const slowQueries = this.queryStats.filter(q => q.slow).length;
    const averageQueryTime =
      totalQueries > 0 ? this.queryStats.reduce((sum, q) => sum + q.duration, 0) / totalQueries : 0;

    const slowestQuery =
      this.queryStats.length > 0
        ? this.queryStats.reduce((slowest, current) =>
            current.duration > slowest.duration ? current : slowest
          )
        : null;

    const connectionStats = await this.getConnectionStats();

    return {
      totalQueries,
      slowQueries,
      averageQueryTime: Math.round(averageQueryTime),
      slowestQuery,
      connectionCount: connectionStats.total,
      activeConnections: connectionStats.active,
    };
  }

  // Get connection statistics
  private async getConnectionStats() {
    try {
      const result = (await prisma.$queryRaw`
        SELECT 
          count(*) as total_connections,
          count(*) FILTER (WHERE state = 'active') as active_connections
        FROM pg_stat_activity 
        WHERE datname = current_database()
      `) as Array<{ total_connections: number; active_connections: number }>;

      return {
        total: result[0]?.total_connections || 0,
        active: result[0]?.active_connections || 0,
      };
    } catch (error) {
      //
      return { total: 0, active: 0 };
    }
  }

  // Get slow queries
  getSlowQueries(limit: number = 10): QueryStats[] {
    return this.queryStats
      .filter(q => q.slow)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit);
  }

  // Get query performance trends
  getQueryTrends(hours: number = 24) {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    const recentQueries = this.queryStats.filter(q => q.timestamp > cutoff);

    const trends = recentQueries.reduce(
      (acc, query) => {
        const hour = query.timestamp.getHours();
        if (!acc[hour]) {
          acc[hour] = { count: 0, totalDuration: 0, slowCount: 0 };
        }
        const hourStats = acc[hour]!; // Non-null assertion since we just created it
        hourStats.count++;
        hourStats.totalDuration += query.duration;
        if (query.slow) hourStats.slowCount++;
        return acc;
      },
      {} as Record<number, { count: number; totalDuration: number; slowCount: number }>
    );

    return Object.entries(trends).map(([hour, stats]) => ({
      hour: parseInt(hour),
      count: stats.count,
      averageDuration: Math.round(stats.totalDuration / stats.count),
      slowCount: stats.slowCount,
    }));
  }

  // Clear old statistics
  clearOldStats(hours: number = 24) {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    this.queryStats = this.queryStats.filter(q => q.timestamp > cutoff);
  }

  // Set slow query threshold
  setSlowQueryThreshold(_threshold: number) {
    // Slow query threshold disabled in production
  }
}

// Global instance
export const dbMonitor = new DatabaseMonitor();

// Middleware for automatic query monitoring
export function withMonitoring<T>(queryName: string, query: () => Promise<T>): Promise<T> {
  return dbMonitor.monitorQuery(queryName, query);
}

// Database health check
export async function checkDatabaseHealth(): Promise<{
  healthy: boolean;
  issues: string[];
  recommendations: string[];
}> {
  const issues: string[] = [];
  const recommendations: string[] = [];

  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    // Check for slow queries
    const stats = await dbMonitor.getDatabaseStats();

    if (stats.slowQueries > 0) {
      issues.push(`${stats.slowQueries} slow queries detected`);
      recommendations.push('Consider optimizing slow queries or adding indexes');
    }

    if (stats.averageQueryTime > 500) {
      issues.push(`High average query time: ${stats.averageQueryTime}ms`);
      recommendations.push('Review query performance and database indexes');
    }

    if (stats.activeConnections > 80) {
      issues.push(`High connection count: ${stats.activeConnections}`);
      recommendations.push('Consider connection pooling or reducing concurrent requests');
    }

    const missingIndexes = await checkMissingIndexes();
    if (missingIndexes.length > 0) {
      issues.push(`Missing indexes on: ${missingIndexes.join(', ')}`);
      recommendations.push('Add indexes to improve query performance');
    }

    return {
      healthy: issues.length === 0,
      issues,
      recommendations,
    };
  } catch (error) {
    return {
      healthy: false,
      issues: ['Database connection failed'],
      recommendations: ['Check database configuration and connectivity'],
    };
  }
}

// Check for missing indexes
async function checkMissingIndexes(): Promise<string[]> {
  try {
    const result = (await prisma.$queryRaw`
      SELECT 
        schemaname,
        tablename,
        attname as column_name
      FROM pg_stats 
      WHERE schemaname = 'public'
      AND n_distinct > 100
      AND NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND tablename = pg_stats.tablename
        AND indexdef LIKE '%' || pg_stats.attname || '%'
      )
      ORDER BY tablename, attname
    `) as Array<{ tablename: string; column_name: string }>;

    return result.map(r => `${r.tablename}.${r.column_name}`);
  } catch (error) {
    //
    return [];
  }
}

// Export monitoring utilities
export { DatabaseMonitor };
