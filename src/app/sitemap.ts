import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://albadel.com.eg';

  const staticRoutes: Array<{
    path: string;
    priority: number;
    changeFrequency: 'daily' | 'monthly' | 'weekly' | 'always' | 'hourly' | 'yearly' | 'never';
  }> = [
    { path: '', priority: 1.0, changeFrequency: 'daily' },
    { path: '/services', priority: 0.9, changeFrequency: 'daily' },
    { path: '/about', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/contact', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/faq', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/register', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/login', priority: 0.6, changeFrequency: 'monthly' },
  ];

  const routes = staticRoutes.map(route => ({
    url: `${baseUrl}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  try {
    const services = await prisma.service.findMany({
      where: { active: true },
      select: { slug: true, updatedAt: true },
    });

    const serviceUrls = services.map(service => ({
      url: `${baseUrl}/service/${service.slug}`,
      lastModified: service.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }));

    return [...routes, ...serviceUrls];
  } catch (error) {
    return routes;
  }
}
