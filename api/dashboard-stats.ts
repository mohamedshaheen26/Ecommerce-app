import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { getDashboardStatsPayload } from "../lib/dashboardStats.mjs";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).end();
  }

  const period =
    typeof req.query.period === "string" ? req.query.period : "30d";

  try {
    const data = await getDashboardStatsPayload(supabaseAdmin, period);
    return res.status(200).json(data);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch dashboard stats";
    return res.status(500).json({
      success: false,
      error: message,
    });
  }
}
