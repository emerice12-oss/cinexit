import { NextResponse } from 'next/server';
import { db } from '../../../../backend/db';

export async function GET() {
  const epochs = db
    .prepare('SELECT * FROM epochs ORDER BY epoch DESC')
    .all();

  const total = epochs.reduce(
    (sum, e) => sum + Number(e.settled_usdc),
    0
  );

  return NextResponse.json({
    epochs,
    totalUSDC: total,
  });
}
