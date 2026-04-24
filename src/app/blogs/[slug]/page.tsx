import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import PostClient from './PostClient';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await prisma.blogPost.findUnique({
    where: { slug: decodeURIComponent(params.slug) },
  });

  if (!post) return { title: 'مقال غير موجود' };

  return {
    title: `${post.seoTitle || post.title} | منصة البديل`,
    description: post.seoDesc || post.excerpt || post.content.substring(0, 160),
    openGraph: {
      title: post.seoTitle || post.title,
      description: post.seoDesc || post.excerpt || post.content.substring(0, 160),
      images: post.coverImage ? [post.coverImage] : [],
    },
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const decodedSlug = decodeURIComponent(params.slug);

  const post = await prisma.blogPost.findUnique({
    where: { slug: decodedSlug, published: true },
    include: {
      tags: true,
    },
  });

  if (!post) {
    notFound();
  }

  // Get related posts (Server Side)
  const relatedPosts = await prisma.blogPost.findMany({
    where: {
      id: { not: post.id },
      published: true,
    },
    take: 3,
    orderBy: { createdAt: 'desc' },
  });

  return <PostClient post={post} relatedPosts={relatedPosts} />;
}
