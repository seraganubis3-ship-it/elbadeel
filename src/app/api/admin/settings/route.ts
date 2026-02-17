import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  await requireAuth();

  try {
    let settings = await prisma.systemSettings.findFirst();

    if (!settings) {
      settings = await prisma.systemSettings.create({
        data: {
          id: 'main',
          siteName: 'البديل',
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth();

    const body = await request.json();

    // Upsert ensures we only have one settings row (id='main')
    const settings = await prisma.systemSettings.upsert({
      where: { id: 'main' },
      update: {
        siteName: body.siteName,
        siteDescription: body.siteDescription,
        contactEmail: body.contactEmail,
        contactPhone: body.contactPhone,
        additionalPhone: body.additionalPhone,
        whatsappPhone: body.whatsappPhone,
        secondaryWhatsappPhone: body.secondaryWhatsappPhone,
        address: body.address,
        workingHours: body.workingHours,
        socialLinks: body.socialLinks,
        defaultDeliveryFee: Number(body.defaultDeliveryFee) || 0,
        paymentNumbers: body.paymentNumbers,
        facebookUrl: body.facebookUrl,
        instagramUrl: body.instagramUrl,
        logoUrl: body.logoUrl,
        tiktokUrl: body.tiktokUrl,
        twitterUrl: body.twitterUrl,
        linkedinUrl: body.linkedinUrl,
        complaintsPhone: body.complaintsPhone,
      },
      create: {
        id: 'main',
        siteName: body.siteName || 'البديل',
        siteDescription: body.siteDescription,
        contactEmail: body.contactEmail,
        contactPhone: body.contactPhone,
        additionalPhone: body.additionalPhone,
        whatsappPhone: body.whatsappPhone,
        secondaryWhatsappPhone: body.secondaryWhatsappPhone,
        address: body.address,
        workingHours: body.workingHours,
        socialLinks: body.socialLinks,
        defaultDeliveryFee: Number(body.defaultDeliveryFee) || 0,
        paymentNumbers: body.paymentNumbers,
        facebookUrl: body.facebookUrl,
        instagramUrl: body.instagramUrl,
        logoUrl: body.logoUrl,
        tiktokUrl: body.tiktokUrl,
        twitterUrl: body.twitterUrl,
        linkedinUrl: body.linkedinUrl,
        complaintsPhone: body.complaintsPhone || '01001544258',
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    // console.error('Settings Update Error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
