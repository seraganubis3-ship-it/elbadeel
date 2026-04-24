import { prisma } from '@/lib/prisma';
import BlogsClient from './BlogsClient';

export const metadata = {
  title: 'المدونة | منصة البديل',
  description: 'أحدث المقالات والأخبار المتعلقة باستخراج الأوراق الرسمية والخدمات الحكومية في مصر.',
  openGraph: {
    title: 'المدونة | منصة البديل',
    description:
      'أحدث المقالات والأخبار المتعلقة باستخراج الأوراق الرسمية والخدمات الحكومية في مصر.',
    type: 'website',
  },
};

export default async function BlogsPage({ searchParams }: { searchParams: { page?: string } }) {
  const page = parseInt(searchParams.page || '1');
  const limit = 9;
  const skip = (page - 1) * limit;

  const where = { published: true };

  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      include: {
        tags: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.blogPost.count({ where }),
  ]);

  return <BlogsClient initialPosts={posts} initialTotal={total} currentPage={page} />;
}
