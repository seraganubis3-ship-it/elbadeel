import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest) {
  try {
    const session = await requireAuth();
    if (!session) { // requireAuth throws if invalid but safe check
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const delegates = await prisma.delegate.findMany({
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ delegates });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error fetching delegates' },
      { status: 500 }
    );
  }
}

async function saveFile(file: File): Promise<string | null> {
    if (!file || file.size === 0) return null;

    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'delegates');
    if (!existsSync(uploadsDir)) {
        try {
            await mkdir(uploadsDir, { recursive: true });
        } catch (e) {
            // Error creating directory
            return null;
        }
    }

    const timestamp = Date.now();
    // Unique filename
    const fileName = `${timestamp}_${Math.random().toString(36).substring(7)}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = join(uploadsDir, fileName);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    await writeFile(filePath, buffer);
    return `/uploads/delegates/${fileName}`;
}

export async function POST(req: NextRequest) {
  try {
    await requireAuth();

    const formData = await req.formData();
    
    const name = formData.get('name') as string;
    const idNumber = formData.get('idNumber') as string;
    const licenseNumber = formData.get('licenseNumber') as string;
    
    // Handle files
    const idCardFrontFile = formData.get('idCardFront') as File | null;
    const idCardBackFile = formData.get('idCardBack') as File | null;
    const unionCardFrontFile = formData.get('unionCardFront') as File | null;
    const unionCardBackFile = formData.get('unionCardBack') as File | null;

    if (!name || !idNumber) {
        return NextResponse.json({ error: 'Name and ID Number are required' }, { status: 400 });
    }

    const idCardFront = idCardFrontFile ? await saveFile(idCardFrontFile) : null;
    const idCardBack = idCardBackFile ? await saveFile(idCardBackFile) : null;
    const unionCardFront = unionCardFrontFile ? await saveFile(unionCardFrontFile) : null;
    const unionCardBack = unionCardBackFile ? await saveFile(unionCardBackFile) : null;

    const delegate = await prisma.delegate.create({
      data: {
        name,
        idNumber,
        licenseNumber,
        idCardFront,
        idCardBack,
        unionCardFront,
        unionCardBack,
        active: true,
      },
    });

    return NextResponse.json({ delegate });
  } catch (error) {
    // Error creating delegate
    return NextResponse.json(
      { error: 'Error creating delegate' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireAuth();

    const formData = await req.formData();
    const id = formData.get('id') as string;
    
    if (!id) {
        return NextResponse.json({ error: 'Delegate ID is required' }, { status: 400 });
    }

    const name = formData.get('name') as string;
    const idNumber = formData.get('idNumber') as string;
    const licenseNumber = formData.get('licenseNumber') as string;
    
    // Handle files
    const idCardFrontFile = formData.get('idCardFront') as File | null;
    const idCardBackFile = formData.get('idCardBack') as File | null;
    const unionCardFrontFile = formData.get('unionCardFront') as File | null;
    const unionCardBackFile = formData.get('unionCardBack') as File | null;

    if (!name || !idNumber) {
        return NextResponse.json({ error: 'Name and ID Number are required' }, { status: 400 });
    }

    // Prepare update data
    const updateData: any = {
        name,
        idNumber,
        licenseNumber,
    };

    // Save and update files only if new ones are uploaded
    if (idCardFrontFile && idCardFrontFile.size > 0) {
        updateData.idCardFront = await saveFile(idCardFrontFile);
    }
    if (idCardBackFile && idCardBackFile.size > 0) {
        updateData.idCardBack = await saveFile(idCardBackFile);
    }
    if (unionCardFrontFile && unionCardFrontFile.size > 0) {
        updateData.unionCardFront = await saveFile(unionCardFrontFile);
    }
    if (unionCardBackFile && unionCardBackFile.size > 0) {
        updateData.unionCardBack = await saveFile(unionCardBackFile);
    }

    const delegate = await prisma.delegate.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ delegate });
  } catch (error) {
    // Error updating delegate
    return NextResponse.json(
      { error: 'Error updating delegate' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAuth();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    await prisma.delegate.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error deleting delegate' },
      { status: 500 }
    );
  }
}
