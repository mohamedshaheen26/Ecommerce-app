import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

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
  debugger;
  const { userId } = req.body;

  try {
    const { data, error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) throw error;

    res.status(200).json({ success: true, user: data.user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
