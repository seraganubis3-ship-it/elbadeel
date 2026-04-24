import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig as authOptions } from '@/auth.config';
import { prisma } from '@/lib/prisma';
import slugify from 'slugify';
import { hasPermission } from '@/lib/permissions';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !hasPermission(session.user as any, 'MANAGE_BLOGS')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const data = await request.json();
    const { title, content, excerpt, coverImage, published, tags, seoTitle, seoDesc } = data;

    const existingPost = await prisma.blogPost.findUnique({
      where: { id },
      include: { tags: true },
    });

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const updateData: any = {
      title,
      content,
      excerpt,
      coverImage,
      seoTitle,
      seoDesc,
      published: published !== undefined ? published : existingPost.published,
    };

    // Update slug if title changed
    if (title && title !== existingPost.title) {
      let slug = title
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\u0600-\u06FF-]+/g, '')
        .replace(/--+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');

      if (slug) {
        const slugExists = await prisma.blogPost.findFirst({
          where: { slug, id: { not: id } },
        });
        if (slugExists) {
          slug = `${slug}-${Date.now().toString().slice(-4)}`;
        }
        updateData.slug = slug;
      }
    }

    // Handle tags
    if (tags) {
      const tagsConnectOrCreate = tags.map((tag: string) => {
        const tagSlug = tag
          .trim()
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w\u0600-\u06FF-]+/g, '');
        return {
          where: { slug: tagSlug },
          create: { name: tag, slug: tagSlug },
        };
      });

      updateData.tags = {
        set: [], // Clear existing tags
        connectOrCreate: tagsConnectOrCreate,
      };
    }

    const post = await prisma.blogPost.update({
      where: { id },
      data: updateData,
      include: { tags: true },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error updating blog post:', error);
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !hasPermission(session.user as any, 'MANAGE_BLOGS')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    await prisma.blogPost.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
