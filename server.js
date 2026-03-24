import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { getDashboardStatsPayload } from "./lib/dashboardStats.mjs";

dotenv.config();

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Supabase client
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// API Routes
app.post("/change-password", async (req, res) => {
  const { userId, newEmail, newPassword } = req.body;

  try {
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      {
        email: newEmail,
        password: newPassword,
      }
    );

    if (error) throw error;

    res.status(200).json({ success: true, user: data.user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/delete-user", async (req, res) => {
  const { userId } = req.body;

  try {
    const { data, error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) throw error;

    res.status(200).json({ success: true, user: data.user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/dashboard-stats", async (req, res) => {
  const period =
    typeof req.query.period === "string" ? req.query.period : "30d";

  try {
    const data = await getDashboardStatsPayload(supabaseAdmin, period);
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err?.message || "Failed to fetch dashboard stats",
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
