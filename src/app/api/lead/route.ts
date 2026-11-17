import { NextResponse } from "next/server";
import { connectDB } from "@/src/db/connect";
import { Lead } from "@/src/db/models/Lead";

const STATUSES = ["NEW", "CONTACTED", "REJECTED", "CLOSED", "PENDING"] as const;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * GET /api/lead?query=acme&status=NEW&page=1&limit=20
 * - query:  case-insensitive match on name / email / phone / companyName
 * - status: one of NEW | CONTACTED | REJECTED | CLOSED | PENDING
 */
export async function GET(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query")?.trim();
    const status = searchParams.get("status")?.toUpperCase();
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10) || 20));

    if (status && !(STATUSES as readonly string[]).includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Use one of: ${STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (query) {
      const rx = new RegExp(escapeRegex(query), "i");
      filter.$or = [{ name: rx }, { email: rx }, { phone: rx }, { companyName: rx }];
    }

    const [leads, total] = await Promise.all([
      Lead.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Lead.countDocuments(filter),
    ]);

    return NextResponse.json(
      { data: leads, page, limit, total, totalPages: Math.ceil(total / limit) },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/lead failed:", error);
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
  }
}

/** POST /api/lead — create a lead. Status is always set server-side to NEW. */
export async function POST(req: Request) {
  try {
    await connectDB();

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const phone = String(body.phone ?? "").trim();
    const companyName = String(body.companyName ?? "").trim();

    const missing = Object.entries({ name, email, phone, companyName })
      .filter(([, v]) => !v)
      .map(([k]) => k);
    if (missing.length) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(", ")}` },
        { status: 400 }
      );
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    // Optional counts: accept only non-negative numbers
    const count = (v: unknown) => {
      if (v === undefined || v === null || v === "") return undefined;
      const n = Number(v);
      return Number.isFinite(n) && n >= 0 ? Math.floor(n) : NaN;
    };
    const noOfAdmin = count(body.noOfAdmin);
    const noOfManagers = count(body.noOfManagers);
    const noOfemployee = count(body.noOfemployee);
    if ([noOfAdmin, noOfManagers, noOfemployee].some((n) => Number.isNaN(n))) {
      return NextResponse.json(
        { error: "noOfAdmin, noOfManagers and noOfemployee must be non-negative numbers" },
        { status: 400 }
      );
    }

    const lead = await Lead.create({
      name,
      email,
      phone,
      companyName,
      noOfAdmin,
      noOfManagers,
      noOfemployee,
    });
    return NextResponse.json(lead, { status: 201 });
  } catch (error: unknown) {
    if ((error as { code?: number })?.code === 11000) {
      return NextResponse.json({ error: "A lead with this email already exists" }, { status: 409 });
    }
    console.error("POST /api/lead failed:", error);
    return NextResponse.json({ error: "Failed to create lead" }, { status: 500 });
  }
}
