// supabase/functions/keep-alive/index.ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

serve(() => {
  return new Response(
    JSON.stringify({ status: "supabase alive ✅" }),
    { headers: { "Content-Type": "application/json" } }
  );
});
