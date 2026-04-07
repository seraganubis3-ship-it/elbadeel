import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig as authOptions } from '@/auth.config';
import { prisma } from '@/lib/prisma';
import slugify from 'slugify';
import { hasPermission } from '@/lib/permissions';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !hasPermission(session.user as any, 'MANAGE_BLOGS')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const posts = await prisma.blogPost.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { name: true, image: true }
        },
        tags: true
      }
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !hasPermission(session.user as any, 'MANAGE_BLOGS')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { title, content, excerpt, coverImage, published, tags, seoTitle, seoDesc } = data;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    // Improved slug generation for Arabic and English
    let slug = title
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/[^\w\u0600-\u06FF-]+/g, '') // Keep alphanumeric, Arabic chars and -
      .replace(/--+/g, '-') // Replace multiple - with single -
      .replace(/^-+/, '') // Trim - from start
      .replace(/-+$/, ''); // Trim - from end
    
    if (!slug) {
      slug = `post-${Date.now()}`;
    }
    
    // Check if slug exists and make unique if needed
    const existingPost = await prisma.blogPost.findUnique({ where: { slug } });
    if (existingPost) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    // Handle tags creation/connection
    const tagsConnectOrCreate = tags?.map((tag: string) => {
      const tagSlug = tag.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w\u0600-\u06FF-]+/g, '');
      return {
        where: { slug: tagSlug },
        create: { name: tag, slug: tagSlug }
      };
    }) || [];

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        coverImage,
        seoTitle,
        seoDesc,
        published: published || false,
        authorId: session.user.id,
        tags: {
          connectOrCreate: tagsConnectOrCreate
        }
      },
      include: {
        tags: true
      }
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error creating blog post:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
