import { NextResponse } from 'next/server';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://dasboard-saas-1.onrender.com";

async function proxyRequest(req: Request) {
  try {
    const url = new URL(req.url);
    const target = `${BASE_URL}${url.pathname}${url.search}`;

    const forwardedHeaders: Record<string, string> = {};
    for (const [key, value] of Array.from(req.headers.entries())) {
      if (key.toLowerCase() === 'host') continue;
      forwardedHeaders[key] = value;
    }

    const res = await fetch(target, { method: req.method, headers: forwardedHeaders, redirect: 'manual' });
    const responseHeaders: Record<string, string> = {};
    res.headers.forEach((v, k) => { if (k.toLowerCase() === 'transfer-encoding') return; responseHeaders[k] = v; });
    return new NextResponse(res.body, { status: res.status, headers: responseHeaders });
  } catch (err) {
    console.error('Proxy to backend failed:', err);
    return NextResponse.json({ error: 'Backend proxy failed', details: String(err) }, { status: 502 });
  }
}

export async function GET(req: Request) {
  return proxyRequest(req);
}

// Original implementation commented out
// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/db';
//
// export async function GET(req: NextRequest) {
//   try {
//     const plans = await prisma.plan.findMany({
//       where: {
//         status: 'ACTIVE',
//       },
//       orderBy: {
//         price: 'asc',
//       },
//     });
//
//     return NextResponse.json({ plans });
//   } catch (error) {
//     console.error('Error fetching plans:', error);
//     return NextResponse.json(
//       { error: 'Failed to fetch plans' },
//       { status: 500 }
//     );
//   }
// }
