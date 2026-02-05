import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://albadel.com.eg';

  // 1. Static Routes
  const routes = [
    '',
    '/services',
    '/about',
    '/contact',
    '/faq',
    '/register',
    '/login',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // 2. Dynamic Service Routes
  const services = await prisma.service.findMany({
    where: { active: true },
    select: { slug: true, updatedAt: true },
  });

  const serviceUrls = services.map((service) => ({
    url: `${baseUrl}/service/${service.slug}`,
    lastModified: service.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  // 3. Dynamic Service Categories (if you have category pages like /services/category-slug)
  // Checking schema, you have Category model with slug. 
  // Attempting to generate if pages exist, otherwise skipping.
  // Assuming /services serves all, but if you filter by category:
  // e.g. /services?category=slug or proper routes. 
  // Currently checking code structure, /services seems to list all. 
  // If there are category pages, add them here. For now sticking to proven routes.

  return [...routes, ...serviceUrls];
}
