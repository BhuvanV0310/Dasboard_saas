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
      try {
        body = await req.arrayBuffer();
      } catch (e) {}
    }

    const res = await fetch(target, {
      method: req.method,
      headers: forwardedHeaders,
      body: body ? Buffer.from(body) : undefined,
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

export async function DELETE(req: Request, context: any) {
  return proxyRequest(req);
}

export async function PATCH(req: Request, context: any) {
  return proxyRequest(req);
}

/*
Original serverless implementation (commented out). Keep for reference and possible restoration.

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth-helpers-server';
import { logError, logInfo } from '@/lib/logger';
import fs from 'fs/promises';

export async function DELETE(_req: Request, context: any) {
  let id = '';
  try {
    const { error } = await requireRole('ADMIN');
    if (error) return error;

    const paramsObj = (context && context.params) ? await context.params : {};
    id = paramsObj.id;
    if (!id) {
      return NextResponse.json({ error: 'Missing upload id' }, { status: 400 });
    }

    const upload = await prisma.csvUpload.findUnique({ where: { id } });
    if (!upload) {
      return NextResponse.json({ error: 'Upload not found' }, { status: 404 });
    }

    // Try to delete the file from disk (best-effort)
    try {
      if (upload.filepath) {
        await fs.unlink(upload.filepath);
      }
    } catch (e) {
      // Log and continue even if file is already gone
      logError(e instanceof Error ? e : String(e), { action: 'unlink csv file', id });
    }

    await prisma.csvUpload.delete({ where: { id } });
    logInfo('CSV upload deleted', { id, filename: upload.filename });

    return NextResponse.json({ success: true });
  } catch (e) {
    logError(e instanceof Error ? e : String(e), { endpoint: '/api/uploads/[id] DELETE', id });
    return NextResponse.json({ error: 'Failed to delete upload' }, { status: 500 });
  }
}

export async function PATCH(req: Request, context: any) {
  let id = '';
  try {
    const { error } = await requireRole('ADMIN');
    if (error) return error;

    const paramsObj = (context && context.params) ? await context.params : {};
    id = paramsObj.id;
    if (!id) return NextResponse.json({ error: 'Missing upload id' }, { status: 400 });

    const body = await req.json().catch(() => ({}));
    // Accept either { action: 'toggle' } or { status: 'ACTIVE' | 'INACTIVE' }
    const action = body.action;
    const status = body.status;

    const upload = await prisma.csvUpload.findUnique({ where: { id } });
    if (!upload) return NextResponse.json({ error: 'Upload not found' }, { status: 404 });

    let newStatus = upload.status;
    if (action === 'toggle') {
      newStatus = upload.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    } else if (status && (status === 'ACTIVE' || status === 'INACTIVE')) {
      newStatus = status;
    } else {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const updated = await prisma.csvUpload.update({ where: { id }, data: { status: newStatus } });
    logInfo('CSV upload status updated', { id, status: newStatus });
    return NextResponse.json({ success: true, id: updated.id, status: updated.status });
  } catch (e) {
    logError(e instanceof Error ? e : String(e), { endpoint: '/api/uploads/[id] PATCH', id });
    return NextResponse.json({ error: 'Failed to update upload' }, { status: 500 });
  }
}

*/
