import { NextResponse } from 'next/server';

// Try to load the backend DB if available (monorepo dev). If not available
// (e.g., frontend-only build), return an empty result rather than failing the build.
let db: any = null
try {
  // Use require in a try/catch so bundlers that disallow static imports
  // outside the project root don't fail during build.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  db = require('../../../../backend/db').db
} catch (err) {
  // backend unavailable during this build — tolerate it
  db = null
}

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
