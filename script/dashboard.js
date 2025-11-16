import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// ===== Supabase setup =====
const supabaseUrl = "https://aozkyflnpmdktwlnqtqk.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvemt5ZmxucG1ka3R3bG5xdHFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNDgxMzYsImV4cCI6MjA3NzcyNDEzNn0.RuMva444UnUcnWpLYCodttRWFzZqg7pM8XU1_-lnoTg";
const supabase = createClient(supabaseUrl, supabaseKey);

// ===== Fetch user info and today's total nutrition stats =====
async function fetchUserAndStats() {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user || userError) return;

    // Fetch account info
    const { data: account } = await supabase
      .from("nutrifit_accounts")
      .select("name, weight, goal, height")
      .eq("email", user.email)
      .single();

    // Update UI basic info
    document.querySelector(".greetings").textContent = `Hi, ${account.name.split(" ")[0]}!`;
    document.querySelector(".weight h1").textContent = account.weight ?? "—";
    document.querySelectorAll(".goal h1")[1].textContent = `${account.goal ?? "—"}kg`;
    document.querySelector(".height h1").textContent = account.height ?? "—";

    // ===== Get totals for today =====
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const { data: stats, error: statsError } = await supabase
      .from("nutrifit_stats")
      .select("carbs, proteins, fats, eaten_cal")
      .eq("user_id", user.id)
      .gte("created_at", startOfDay.toISOString())
      .lte("created_at", endOfDay.toISOString());

    if (statsError) {
      console.error("Error fetching stats:", statsError);
      return;
    }

    // Sum all today's values
    const totals = stats?.reduce(
      (acc, row) => {
        acc.carbs += row.carbs || 0;
        acc.proteins += row.proteins || 0;
        acc.fats += row.fats || 0;
        acc.eaten_cal += row.eaten_cal || 0;
        return acc;
      },
      { carbs: 0, proteins: 0, fats: 0, eaten_cal: 0 }
    ) || { carbs: 0, proteins: 0, fats: 0, eaten_cal: 0 };

    // Update dashboard macros
    // Update dashboard macros (rounded to 2 decimals)
document.querySelector(".carbs h1").textContent = totals.carbs.toFixed(0);
document.querySelector(".proteins h1").textContent = totals.proteins.toFixed(0);
document.querySelector(".fats h1").textContent = totals.fats.toFixed(0);
document.querySelector(".current-cal h1").textContent = totals.eaten_cal.toFixed(0);

  } catch (err) {
    console.error("❌ Unexpected error:", err);
  }
}

// ===== Live clock and date =====
function updateDateTime() {
  const now = new Date();
  document.querySelector(".oras").textContent = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
  document.querySelector(".araw").textContent = now.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

// ===== Initialize =====
document.addEventListener("DOMContentLoaded", () => {
  updateDateTime();
  setInterval(updateDateTime, 1000);
  fetchUserAndStats();
});
