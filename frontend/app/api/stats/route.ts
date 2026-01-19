import { NextResponse } from 'next/server';

import { db } from '../../../lib/db';

export async function GET() {
  if (!db) {
    return NextResponse.json({ epochs: [], totalUSDC: 0 })
  }

  const epochs = db.prepare('SELECT * FROM epochs ORDER BY epoch DESC').all()

  const total = epochs.reduce((sum: number, e: any) => sum + Number(e.settled_usdc), 0)

  return NextResponse.json({
    epochs,
    totalUSDC: total,
  })
}
