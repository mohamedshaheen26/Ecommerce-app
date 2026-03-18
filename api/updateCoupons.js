const { createClient } = require("@supabase/supabase-js");
const path = require("path");
const dotenv = require("dotenv");

// Load root .env for local runs (GitHub Actions uses secrets env).
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSupabaseConnectivity() {
  const url = String(supabaseUrl).replace(/\/+$/, "");

  if (!/^https?:\/\/.+/i.test(url)) {
    console.error("Invalid SUPABASE_URL (must start with http/https):", supabaseUrl);
    process.exit(1);
  }

  // Quick health check to distinguish "bad URL / blocked network" from "DB/RLS error".
  // We hit the REST endpoint with an API key header; if networking is OK, we should
  // at least get an HTTP response (even 401/404 is fine for connectivity purposes).
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const res = await fetch(`${url}/rest/v1/`, {
      method: "GET",
      headers: {
        apikey: supabaseKey,
      },
      signal: controller.signal,
    });

    if (!res.ok) {
      // Still considered "reachable"; print status for debugging.
      console.log("Supabase reachable:", res.status, res.statusText);
    }
  } catch (err) {
    console.error("Cannot reach Supabase (network/DNS/proxy/TLS issue).");
    console.error("SUPABASE_URL:", url);
    console.error("Error:", err?.cause ?? err);
    process.exit(1);
  } finally {
    clearTimeout(timeout);
  }
}

async function updateCouponsStatus() {
  await checkSupabaseConnectivity();
  const now = new Date();

  const { data: coupons, error: fetchError } = await supabase
    .from("coupons")
    .select("id, starts_at, expires_at, is_active");

  if (fetchError) {
    console.error("Error fetching coupons:", fetchError);
    process.exit(1);
  }

  const idsToActivate = [];
  const idsToDeactivate = [];

  for (const c of coupons ?? []) {
    const startsAt = c.starts_at ? new Date(c.starts_at) : null;
    const expiresAt = c.expires_at ? new Date(c.expires_at) : null;

    // If dates are invalid/missing, treat as inactive.
    const shouldBeActive =
      startsAt instanceof Date &&
      !Number.isNaN(startsAt.getTime()) &&
      expiresAt instanceof Date &&
      !Number.isNaN(expiresAt.getTime()) &&
      startsAt <= now &&
      expiresAt >= now;

    if (shouldBeActive && !c.is_active) idsToActivate.push(c.id);
    if (!shouldBeActive && c.is_active) idsToDeactivate.push(c.id);
  }

  let updatedCount = 0;

  if (idsToActivate.length) {
    const { error } = await supabase
      .from("coupons")
      .update({ is_active: true })
      .in("id", idsToActivate);
    if (error) {
      console.error("Error activating coupons:", error);
      process.exit(1);
    }
    updatedCount += idsToActivate.length;
  }

  if (idsToDeactivate.length) {
    const { error } = await supabase
      .from("coupons")
      .update({ is_active: false })
      .in("id", idsToDeactivate);
    if (error) {
      console.error("Error deactivating coupons:", error);
      process.exit(1);
    }
    updatedCount += idsToDeactivate.length;
  }

  console.log("Coupons status update ran at", now.toISOString(), {
    updatedCount,
    activated: idsToActivate.length,
    deactivated: idsToDeactivate.length,
  });
}

updateCouponsStatus().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
