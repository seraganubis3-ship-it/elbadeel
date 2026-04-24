import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '9');
    const page = parseInt(searchParams.get('page') || '1');
    const slug = searchParams.get('slug');
    const search = searchParams.get('search');
    const skip = (page - 1) * limit;

    // Handle single post fetch by slug
    if (slug) {
      const post = await prisma.blogPost.findUnique({
        where: { slug: decodeURIComponent(slug), published: true },
        include: {
          tags: true,
        },
      });

      if (!post) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });
      }

      // Get related posts (exclude current)
      const relatedPosts = await prisma.blogPost.findMany({
        where: {
          id: { not: post.id },
          published: true,
        },
        take: 3,
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json({ post, relatedPosts });
    }

    // Handle list fetch with search and pagination
    const where: any = {
      published: true,
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        include: {
          tags: {
            select: { id: true, name: true, slug: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.blogPost.count({ where }),
    ]);

    return NextResponse.json({
      posts,
      total,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error('Error fetching public blogs:', error);
    return NextResponse.json({ error: 'Failed to fetch blogs' }, { status: 500 });
  }
}
