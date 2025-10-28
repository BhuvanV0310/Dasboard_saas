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
