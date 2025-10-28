import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth-helpers-server';
import { logError, logInfo } from '@/lib/logger';
import { checkRateLimit, getClientIp, generateRateLimitKey } from '@/lib/rate-limit';
import path from 'path';
import fs from 'fs/promises';
import { createReadStream } from 'fs';
import { parse } from 'fast-csv';

const UPLOAD_DIR = path.join(process.cwd(), 'tmp', 'uploads');
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: Request) {
  try {
    // Auth: Only allow admin
    const { error, session } = await requireRole('ADMIN');
    if (error) return error;

    // Rate limiting: 10 requests per minute per user/IP
    const ip = getClientIp(req);
    const rateLimitKey = generateRateLimitKey(session!.user.id, ip);
    const rateLimit = checkRateLimit(rateLimitKey, { maxRequests: 10, windowMs: 60000 });
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: 'Too many upload requests. Please try again later.',
          retryAfter: Math.ceil((rateLimit.resetAt - Date.now()) / 1000),
        },
        { 
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)),
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': String(rateLimit.remaining),
            'X-RateLimit-Reset': String(Math.floor(rateLimit.resetAt / 1000)),
          },
        }
      );
    }

    // Parse formData
    const formData = await req.formData();
    const file = formData.get('file');
    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      return NextResponse.json({ error: 'Invalid file type. Only .csv allowed.' }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large. Max 10MB.' }, { status: 400 });
    }

    // Ensure upload dir exists
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    const filename = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const filepath = path.join(UPLOAD_DIR, filename);

    // Save file
    const buffer = await file.arrayBuffer();
    await fs.writeFile(filepath, Buffer.from(buffer));

    // Parse CSV for row/column count
    let rowCount = 0;
    let columnCount = 0;
    let columns: string[] = [];
    let parseError = null;
    try {
      const stream = createReadStream(filepath);
      await new Promise((resolve, reject) => {
        let firstRow = true;
        stream
          .pipe(parse({ headers: true }))
          .on('error', (err: Error) => {
            parseError = err;
            reject(err);
          })
          .on('data', (row: Record<string, any>) => {
            if (firstRow) {
              columns = Object.keys(row);
              columnCount = columns.length;
              firstRow = false;
            }
            rowCount++;
          })
          .on('end', () => resolve(null));
      });
    } catch (err) {
      logError(err instanceof Error ? err : String(err), { filename: file.name, userId: session!.user.id });
      return NextResponse.json({ error: 'CSV parse error', details: String(parseError || err) }, { status: 400 });
    }

    // Create CsvUpload record
    const upload = await prisma.csvUpload.create({
      data: {
        filename: file.name,
        filepath,
        uploadedById: session!.user.id,
        summaryJson: {
          rowCount,
          columnCount,
          columns,
        },
      },
    });

    logInfo('CSV upload successful', { uploadId: upload.id, filename: file.name, userId: session!.user.id });
    return NextResponse.json({ uploadId: upload.id, rowCount, columnCount, columns });
  } catch (error) {
    logError(error instanceof Error ? error : String(error), { endpoint: '/api/uploads POST' });
    return NextResponse.json({ error: 'Upload failed', details: String(error) }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    // Auth: Only allow admin
    const { error } = await requireRole('ADMIN');
    if (error) return error;

    // Get query params
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    // Fetch uploads
    const uploads = await prisma.csvUpload.findMany({
      where: userId ? { uploadedById: userId } : {},
      orderBy: { uploadedAt: 'desc' },
      select: {
        id: true,
        filename: true,
        status: true,
        uploadedAt: true,
        summaryJson: true,
      },
    });

    return NextResponse.json(uploads);
  } catch (error) {
    logError(error instanceof Error ? error : String(error), { endpoint: '/api/uploads GET' });
    return NextResponse.json({ error: 'Failed to fetch uploads' }, { status: 500 });
  }
}
