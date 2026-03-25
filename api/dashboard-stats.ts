import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).end();
  }

  const period =
    typeof req.query.period === "string" ? req.query.period : "30d";

  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
      return res.status(500).json({
        success: false,
        error:
          "Missing SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY in Vercel environment variables",
      });
    }

    // Dynamic import avoids any bundling/runtime ESM resolution issues.
    const { getDashboardStatsPayload } = await import("../lib/dashboardStats.mjs");
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const data = await getDashboardStatsPayload(supabaseAdmin, period);
    return res.status(200).json(data);
  } catch (err: unknown) {
    const message =
      typeof (err as any)?.message === "string"
        ? (err as any).message
        : "Failed to fetch dashboard stats";
    console.error("dashboard-stats failed:", message, err);
    return res.status(500).json({
      success: false,
      error: message,
    });
  }
}
