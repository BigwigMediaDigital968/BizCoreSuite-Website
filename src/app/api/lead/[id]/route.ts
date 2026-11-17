import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/src/db/connect";
import { Lead } from "@/src/db/models/Lead";

const STATUSES = ["NEW", "CONTACTED", "REJECTED", "CLOSED", "PENDING"];
// Fields a client may change
const EDITABLE = ["name", "phone", "companyName", "noOfAdmin", "noOfManagers", "noOfemployee", "status"];

type Ctx = { params: Promise<{ id: string }> };

async function resolveId(ctx: Ctx) {
  const { id } = await ctx.params;
  return mongoose.isValidObjectId(id) ? id : null;
}

/** GET /api/lead/:id */
export async function GET(_req: Request, ctx: Ctx) {
  try {
    const id = await resolveId(ctx);
    if (!id) return NextResponse.json({ error: "Invalid lead id" }, { status: 400 });

    await connectDB();
    const lead = await Lead.findById(id).lean();
    if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    return NextResponse.json(lead, { status: 200 });
  } catch (error) {
    console.error("GET /api/lead/[id] failed:", error);
    return NextResponse.json({ error: "Failed to fetch lead" }, { status: 500 });
  }
}

/** PATCH /api/lead/:id — update status and/or details */
export async function PATCH(req: Request, ctx: Ctx) {
  try {
    const id = await resolveId(ctx);
    if (!id) return NextResponse.json({ error: "Invalid lead id" }, { status: 400 });

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const update: Record<string, unknown> = {};
    for (const key of EDITABLE) if (body[key] !== undefined) update[key] = body[key];

    if (!Object.keys(update).length) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }
    if (update.status !== undefined && !STATUSES.includes(String(update.status))) {
      return NextResponse.json(
        { error: `Invalid status. Use one of: ${STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    await connectDB();
    const lead = await Lead.findByIdAndUpdate(id, update, { new: true, runValidators: true }).lean();
    if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    return NextResponse.json(lead, { status: 200 });
  } catch (error: unknown) {
    if ((error as { name?: string })?.name === "ValidationError") {
      return NextResponse.json({ error: (error as Error).message }, { status: 400 });
    }
    console.error("PATCH /api/lead/[id] failed:", error);
    return NextResponse.json({ error: "Failed to update lead" }, { status: 500 });
  }
}

/** DELETE /api/lead/:id */
export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    const id = await resolveId(ctx);
    if (!id) return NextResponse.json({ error: "Invalid lead id" }, { status: 400 });

    await connectDB();
    const lead = await Lead.findByIdAndDelete(id).lean();
    if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/lead/[id] failed:", error);
    return NextResponse.json({ error: "Failed to delete lead" }, { status: 500 });
  }
}
