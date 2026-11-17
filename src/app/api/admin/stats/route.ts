import { NextResponse } from "next/server";
import { connectDB } from "@/src/db/connect";
import { Lead } from "@/src/db/models/Lead";
import { Blog } from "@/src/db/models/Blog";

const DAYS = 14;

/** GET /api/admin/stats — dashboard numbers (admin only, enforced in proxy.ts) */
export async function GET() {
  try {
    await connectDB();

    const since = new Date();
    since.setHours(0, 0, 0, 0);
    since.setDate(since.getDate() - (DAYS - 1));

    const staleBefore = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

    const [byStatus, daily, recent, blogsByStatus, stale] = await Promise.all([
      Lead.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Lead.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      ]),
      Lead.find({}).sort({ createdAt: -1 }).limit(6).lean(),
      Blog.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      // New leads nobody has picked up for 2+ days
      Lead.countDocuments({ status: "NEW", createdAt: { $lt: staleBefore } }),
    ]);

    const leadCounts: Record<string, number> = { NEW: 0, CONTACTED: 0, PENDING: 0, CLOSED: 0, REJECTED: 0 };
    byStatus.forEach((r) => (leadCounts[r._id] = r.count));

    const dailyMap = new Map<string, number>(daily.map((d) => [d._id as string, d.count as number]));
    const series = Array.from({ length: DAYS }, (_, i) => {
      const d = new Date(since);
      d.setDate(since.getDate() + i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      return { date: key, count: dailyMap.get(key) ?? 0 };
    });

    const blogCounts: Record<string, number> = { PUBLISHED: 0, DRAFT: 0 };
    blogsByStatus.forEach((r) => (blogCounts[r._id] = r.count));

    return NextResponse.json({
      leads: { total: Object.values(leadCounts).reduce((a, b) => a + b, 0), byStatus: leadCounts, series, recent, stale },
      blogs: { total: blogCounts.PUBLISHED + blogCounts.DRAFT, ...blogCounts },
    });
  } catch (error) {
    console.error("GET /api/admin/stats failed:", error);
    return NextResponse.json({ error: "Failed to load stats" }, { status: 500 });
  }
}
