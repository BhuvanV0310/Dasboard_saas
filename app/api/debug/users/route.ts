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

    const res = await fetch(target, {
      method: req.method,
      headers: forwardedHeaders,
      redirect: 'manual',
    });

    const responseHeaders: Record<string, string> = {};
    res.headers.forEach((v, k) => {
      if (k.toLowerCase() === 'transfer-encoding') return;
      responseHeaders[k] = v;
    });

    return new NextResponse(res.body, { status: res.status, headers: responseHeaders });
  } catch (err) {
    console.error('Proxy to backend failed:', err);
    return NextResponse.json({ error: 'Backend proxy failed', details: String(err) }, { status: 502 });
  }
}

export async function GET(req: Request) {
  return proxyRequest(req);
}

/*
Original serverless implementation (commented out). Keep for reference and possible restoration.

import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const USERS_PATH = path.join(process.cwd(), 'data', 'users.json');

async function readUsers(): Promise<any[]> {
  const txt = await fs.readFile(USERS_PATH, 'utf8').catch(() => '[]');
  try {
    return JSON.parse(txt || '[]');
  } catch (e) {
    return [];
  }
}

// Dev-only endpoint to list users (email + role) for debugging local setups.
// Disabled in production builds.
export async function GET(req: Request) {
  try {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ success: false, message: 'Not available in production' }, { status: 403 });
    }

    const users = await readUsers();
    const safe = users.map((u: any) => ({ email: u.email, role: u.role }));
    return NextResponse.json({ success: true, users: safe }, { status: 200 });
  } catch (err) {
    console.error('debug users error', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

*/
