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

		let body: ArrayBuffer | undefined = undefined;
		if (req.method !== 'GET' && req.method !== 'HEAD') {
			try { body = await req.arrayBuffer(); } catch (e) {}
		}

		const res = await fetch(target, {
			method: req.method,
			headers: forwardedHeaders,
			body: body ? Buffer.from(body) : undefined,
			redirect: 'manual',
		});

		const responseHeaders: Record<string, string> = {};
		res.headers.forEach((v, k) => { if (k.toLowerCase() === 'transfer-encoding') return; responseHeaders[k] = v; });
		return new NextResponse(res.body, { status: res.status, headers: responseHeaders });
	} catch (err) {
		console.error('Proxy to backend failed:', err);
		return NextResponse.json({ error: 'Backend proxy failed', details: String(err) }, { status: 502 });
	}
}

export async function POST(req: Request) {
	return proxyRequest(req);
}

// Original implementation preserved below for reference
// import { NextResponse } from 'next/server';
// import fs from 'fs/promises';
// import path from 'path';
// import { verifyToken } from '../../../lib/auth';
//
// const USERS_PATH = path.join(process.cwd(), 'data', 'users.json');
//
// async function readUsers(): Promise<any[]> {
//   try {
//     const txt = await fs.readFile(USERS_PATH, 'utf8');
//     return JSON.parse(txt || '[]');
//   } catch (e) {
//     return [];
//   }
// }
//
// async function writeUsers(users: any[]) {
//   await fs.writeFile(USERS_PATH, JSON.stringify(users, null, 2), 'utf8');
// }
//
// export async function POST(req: Request) {
//   try {
//     const authHeader = req.headers.get('authorization') || '';
//     const authToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader || null;
//     const decoded = verifyToken(authToken || undefined) as any;
//     if (!decoded || decoded.role !== 'admin') {
//       return NextResponse.json({ success: false, message: 'Forbidden: admin token required' }, { status: 403 });
//     }
//
//     const body = await req.json().catch(() => ({}));
//     const emails: string[] = body.emails || [];
//     if (!emails.length) return NextResponse.json({ success: false, message: 'No emails provided' }, { status: 400 });
//
//     const users = await readUsers();
//     const remaining = users.filter(u => !emails.includes(String(u.email).toLowerCase()));
//     await writeUsers(remaining);
//     return NextResponse.json({ success: true }, { status: 200 });
//   } catch (e) {
//     console.error('delete-user error', e);
//     return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
//   }
// }

