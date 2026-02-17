// Daily reports generation job
import { prisma } from '@/lib/prisma';
import { addEmailJob } from '@/lib/queue/queues';

/**
 * Generate and send daily reports to admins
 */
export async function generateDailyReports() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's statistics
    const [totalOrders, completedOrders, pendingOrders, totalRevenue, newCustomers] =
      await Promise.all([
        // Total orders today
        prisma.order.count({
          where: {
            createdAt: {
              gte: today,
              lt: tomorrow,
            },
          },
        }),

        // Completed orders today
        prisma.order.count({
          where: {
            createdAt: {
              gte: today,
              lt: tomorrow,
            },
            status: 'completed',
          },
        }),

        // Pending orders
        prisma.order.count({
          where: {
            status: {
              in: ['pending', 'in_progress', 'supply'],
            },
          },
        }),

        // Total revenue today
        prisma.order.aggregate({
          where: {
            createdAt: {
              gte: today,
              lt: tomorrow,
            },
            status: 'completed',
          },
          _sum: {
            totalPrice: true,
          },
        }),

        // New customers today
        prisma.user.count({
          where: {
            createdAt: {
              gte: today,
              lt: tomorrow,
            },
            role: 'customer',
          },
        }),
      ]);

    // Get top services
    const topServices = await prisma.order.groupBy({
      by: ['serviceId'],
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 5,
    });

    // Get service names
    const serviceIds = topServices.map(s => s.serviceId).filter(Boolean) as string[];
    const services = await prisma.service.findMany({
      where: {
        id: {
          in: serviceIds,
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    const serviceMap = new Map(services.map(s => [s.id, s.name]));

    // Generate HTML report
    const reportHtml = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; direction: rtl; padding: 20px; }
          .header { background: #4f46e5; color: white; padding: 20px; border-radius: 8px; }
          .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
          .stat-card { background: #f3f4f6; padding: 15px; border-radius: 8px; text-align: center; }
          .stat-value { font-size: 32px; font-weight: bold; color: #4f46e5; }
          .stat-label { color: #6b7280; margin-top: 5px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb; }
          th { background: #f9fafb; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📊 التقرير اليومي - ${today.toLocaleDateString('ar-EG')}</h1>
          <p>منصة البديل لاستخراج الأوراق الرسمية</p>
        </div>

        <div class="stats">
          <div class="stat-card">
            <div class="stat-value">${totalOrders}</div>
            <div class="stat-label">إجمالي الطلبات اليوم</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${completedOrders}</div>
            <div class="stat-label">طلبات مكتملة</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${pendingOrders}</div>
            <div class="stat-label">طلبات قيد التنفيذ</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${(totalRevenue._sum.totalPrice || 0).toLocaleString('ar-EG')} ج.م</div>
            <div class="stat-label">الإيرادات اليوم</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${newCustomers}</div>
            <div class="stat-label">عملاء جدد</div>
          </div>
        </div>

        <h2>أكثر الخدمات طلباً</h2>
        <table>
          <thead>
            <tr>
              <th>الخدمة</th>
              <th>عدد الطلبات</th>
            </tr>
          </thead>
          <tbody>
            ${topServices
              .map(
                s => `
              <tr>
                <td>${serviceMap.get(s.serviceId!) || 'غير محدد'}</td>
                <td>${s._count.id}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>

        <p style="margin-top: 30px; color: #6b7280; font-size: 12px;">
          تم إنشاء هذا التقرير تلقائياً بواسطة نظام البديل
        </p>
      </body>
      </html>
    `;

    // Get admin emails
    const admins = await prisma.user.findMany({
      where: {
        role: 'admin',
      },
      select: {
        email: true,
      },
    });

    // Send email to each admin
    for (const admin of admins) {
      if (admin.email) {
        await addEmailJob({
          to: admin.email,
          subject: `📊 التقرير اليومي - ${today.toLocaleDateString('ar-EG')}`,
          html: reportHtml,
        });
      }
    }

    // eslint-disable-next-line no-console
    console.log(`📊 Daily report generated and sent to ${admins.length} admins`);

    return {
      totalOrders,
      completedOrders,
      pendingOrders,
      revenue: totalRevenue._sum.totalPrice || 0,
      newCustomers,
      adminCount: admins.length,
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Reports job error:', error);
    throw error;
  }
}
