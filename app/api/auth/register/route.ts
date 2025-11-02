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
// import { NextRequest, NextResponse } from "next/server";
// import bcrypt from "bcryptjs";
// import prisma from "@/lib/db";
//
// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();
//     const { email, password, name, role } = body;
//
//     // Validation
//     if (!email || !password) {
//       return NextResponse.json(
//         { error: "Email and password are required" },
//         { status: 400 }
//       );
//     }
//
//     if (password.length < 6) {
//       return NextResponse.json(
//         { error: "Password must be at least 6 characters" },
//         { status: 400 }
//       );
//     }
//
//     // Check if user already exists
//     const existingUser = await prisma.user.findUnique({
//       where: { email },
//     });
//
//     if (existingUser) {
//       return NextResponse.json(
//         { error: "User with this email already exists" },
//         { status: 409 }
//       );
//     }
//
//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);
//
//     // Create user with specified role or default to CUSTOMER
//     const user = await prisma.user.create({
//       data: {
//         email,
//         password: hashedPassword,
//         name: name || null,
//         role: role || "CUSTOMER", // Default role
//       },
//       select: {
//         id: true,
//         email: true,
//         name: true,
//         role: true,
//         createdAt: true,
//       },
//     });
//
//     return NextResponse.json(
//       {
//         message: "User created successfully",
//         user,
//       },
//       { status: 201 }
//     );
//   } catch (error) {
//     console.error("Registration error:", error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }
