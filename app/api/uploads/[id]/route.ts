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
