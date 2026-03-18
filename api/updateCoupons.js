import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load root .env for local runs; GitHub Actions provides these via secrets.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateCoupons() {
  const now = new Date().toISOString();

  const { data: coupons, error } = await supabase
    .from("coupons")
    .select("id, starts_at, expires_at, is_active");

  if (error) {
    console.error("Error fetching coupons:", error);
    return;
  }

  const couponsToCheck = coupons ?? [];
  let updatedCount = 0;

  for (const coupon of couponsToCheck) {
    let newStatus = false;
    if (
      new Date(coupon.starts_at) <= new Date() &&
      new Date(coupon.expires_at) >= new Date()
    ) {
      newStatus = true;
    }

    if (coupon.is_active !== newStatus) {
      const { error: updateError } = await supabase
        .from("coupons")
        .update({ is_active: newStatus, last_checked_at: now })
        .eq("id", coupon.id);

      if (updateError) {
        console.error(`Error updating coupon ${coupon.id}:`, updateError);
      } else {
        console.log(`Coupon ${coupon.id} updated: is_active = ${newStatus}`);
        updatedCount += 1;
      }
    }
  }

  console.log("Coupon status updater completed:", {
    checked: couponsToCheck.length,
    updated: updatedCount,
    ranAt: now,
  });
}

updateCoupons().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
