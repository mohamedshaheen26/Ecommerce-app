import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { userId } = req.body;

  try {
    const { data, error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) throw error;

    res.status(200).json({ success: true, user: data.user });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}
