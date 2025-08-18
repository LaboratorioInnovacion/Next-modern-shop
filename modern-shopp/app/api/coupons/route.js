import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  const coupons = await prisma.coupon.findMany();
  return NextResponse.json(coupons);
}

export async function POST(req) {
  const data = await req.json();
  const coupon = await prisma.coupon.create({ data });
  return NextResponse.json(coupon, { status: 201 });
}

export async function PUT(req) {
  const { id, ...data } = await req.json();
  const coupon = await prisma.coupon.update({ where: { id }, data });
  return NextResponse.json(coupon);
}

export async function DELETE(req) {
  const { id } = await req.json();
  await prisma.coupon.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
