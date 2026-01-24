import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageName = searchParams.get('name');

    if (!imageName) {
      return NextResponse.json({ error: 'Image name is required' }, { status: 400 });
    }

    const imagesDir = path.join(process.cwd(), 'public', 'images');
    const imagePath = path.join(imagesDir, imageName);

    // Check if image exists
    const exists = fs.existsSync(imagePath);

    if (exists) {
      const stats = fs.statSync(imagePath);
      return NextResponse.json({
        exists: true,
        size: stats.size,
        lastModified: stats.mtime,
        path: `/images/${imageName}`,
      });
    } else {
      // Check for alternative extensions
      const extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
      const baseName = path.parse(imageName).name;

      for (const ext of extensions) {
        const altPath = path.join(imagesDir, `${baseName}${ext}`);
        if (fs.existsSync(altPath)) {
          const stats = fs.statSync(altPath);
          return NextResponse.json({
            exists: true,
            size: stats.size,
            lastModified: stats.mtime,
            path: `/images/${baseName}${ext}`,
            alternative: true,
          });
        }
      }

      return NextResponse.json(
        {
          exists: false,
          message: 'Image not found',
        },
        { status: 404 }
      );
    }
  } catch (error) {
    //
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { imageName, width = 400, height = 300, color = '#059669' } = await request.json();

    if (!imageName) {
      return NextResponse.json({ error: 'Image name is required' }, { status: 400 });
    }

    // Generate SVG placeholder
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${color}"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" fill="white" text-anchor="middle" dy=".3em">
          ${imageName.replace(/\.(jpg|png|jpeg|gif)$/, '')}
        </text>
      </svg>
    `;

    const imagesDir = path.join(process.cwd(), 'public', 'images');
    const imagePath = path.join(imagesDir, imageName);

    fs.writeFileSync(imagePath, svg);

    return NextResponse.json({
      success: true,
      message: `Placeholder image created: ${imageName}`,
      path: `/images/${imageName}`,
    });
  } catch (error) {
    //
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
