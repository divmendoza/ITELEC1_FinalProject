// ======================================================================
// 🧩 SUPABASE INITIALIZATION
// ======================================================================
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://aozkyflnpmdktwlnqtqk.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvemt5ZmxucG1ka3R3bG5xdHFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNDgxMzYsImV4cCI6MjA3NzcyNDEzNn0.RuMva444UnUcnWpLYCodttRWFzZqg7pM8XU1_-lnoTg";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ======================================================================
// 📅 DATE NAVIGATION
// ======================================================================
let currentDate = new Date();
const currentDateDisplay = document.getElementById("current-date");
const prevDayBtn = document.getElementById("prev-day");
const nextDayBtn = document.getElementById("next-day");

function formatDate(date) {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function updateDateDisplay() {
  currentDateDisplay.textContent = formatDate(currentDate);
}

prevDayBtn.addEventListener("click", async () => {
  currentDate.setDate(currentDate.getDate() - 1);
  updateDateDisplay();
  await updateUserStats();
});

nextDayBtn.addEventListener("click", async () => {
  currentDate.setDate(currentDate.getDate() + 1);
  updateDateDisplay();
  await updateUserStats();
});

// ======================================================================
// 💾 LOG FOOD TO SUPABASE
// ======================================================================
async function logFoodToSupabase(food) {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("Error fetching user:", userError);
      alert("🚫 No logged-in user found. Please log in again.");
      return;
    }

    const currentUserId = user.id;
    const { calories, carbohydrates_total_g, protein_g, fat_total_g } = food;

    const { error } = await supabase.from("nutrifit_stats").insert([
      {
        user_id: currentUserId,
        eaten_cal: calories,
        carbs: carbohydrates_total_g,
        fats: fat_total_g,
        proteins: protein_g,
      },
    ]);

    if (error) {
      console.error("Supabase insert error:", error);
      alert(`🚫 Failed to log food.\nError: ${error.message}`);
      return;
    }

    await updateUserStats();
  } catch (err) {
    console.error("Error logging food:", err);
    alert(`🚫 Failed to log food.\n${err.message}`);
  }
}

// ======================================================================
// 📊 FETCH & DISPLAY USER STATS
// ======================================================================
async function updateUserStats() {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const currentUserId = user.id;

    const startOfDay = new Date(currentDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(currentDate);
    endOfDay.setHours(23, 59, 59, 999);

    const startISO = startOfDay.toISOString();
    const endISO = endOfDay.toISOString();

    const { data: stats, error } = await supabase
      .from("nutrifit_stats")
      .select("eaten_cal, carbs, proteins, fats, created_at")
      .eq("user_id", currentUserId)
      .gte("created_at", startISO)
      .lte("created_at", endISO);

    if (error) {
      console.error("Error fetching stats:", error);
      return;
    }

    if (!stats || stats.length === 0) {
      resetStatsUI();
      return;
    }

    const totals = stats.reduce(
      (acc, row) => ({
        calories: acc.calories + (row.eaten_cal || 0),
        carbs: acc.carbs + (row.carbs || 0),
        proteins: acc.proteins + (row.proteins || 0),
        fats: acc.fats + (row.fats || 0),
      }),
      { calories: 0, carbs: 0, proteins: 0, fats: 0 }
    );

    const dailyGoal = 2800;
    const carbGoal = 224;
    const proteinGoal = 128;
    const fatGoal = 128;

    document.querySelector(".eaten h2").textContent = totals.calories.toFixed(0);
    document.querySelector(".calorie-ring .text h3").textContent = (
      dailyGoal - totals.calories
    ).toFixed(0);

    const macroH3 = document.querySelectorAll(".macro-text h3");
    macroH3[0].textContent = totals.carbs.toFixed(0);
    macroH3[1].textContent = totals.proteins.toFixed(0);
    macroH3[2].textContent = totals.fats.toFixed(0);

    const macroP = document.querySelectorAll(".macro-text p");
    macroP[0].textContent = `/${carbGoal} g`;
    macroP[1].textContent = `/${proteinGoal} g`;
    macroP[2].textContent = `/${fatGoal} g`;

    updateRings(".progress", totals.calories / dailyGoal);
    updateRings(".macro-progress.carbs", totals.carbs / carbGoal);
    updateRings(".macro-progress.protein", totals.proteins / proteinGoal);
    updateRings(".macro-progress.fat", totals.fats / fatGoal);
  } catch (err) {
    console.error("Error updating stats:", err);
  }
}

function resetStatsUI() {
  document.querySelector(".eaten h2").textContent = "0";
  document.querySelector(".calorie-ring .text h3").textContent = "2800";

  const macroH3 = document.querySelectorAll(".macro-text h3");
  macroH3.forEach((el) => (el.textContent = "0"));

  updateRings(".progress", 0);
  updateRings(".macro-progress.carbs", 0);
  updateRings(".macro-progress.protein", 0);
  updateRings(".macro-progress.fat", 0);
}

function updateRings(selector, progress) {
  const circle = document.querySelector(selector);
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - Math.min(progress, 1) * circumference;

  circle.style.strokeDasharray = `${circumference}`;
  circle.style.strokeDashoffset = `${offset}`;
  circle.style.transition = "stroke-dashoffset 1s ease";
}

// ======================================================================
// 🍎 CALORIE NINJAS FETCH
// ======================================================================
const CALORIE_NINJAS_KEY = "mpYvgUoVnUL1SHit66oDbPHLpotvqp15MTjKI5cF";
const inputField = document.querySelector(".tracker-input input");
const searchButton = document.querySelector(".tracker-input button");
const resultContainer = document.querySelector(".tracker-result");

async function fetchNutrition() {
  const query = inputField?.value.trim();
  if (!query) {
    resultContainer.innerHTML = `<div class="error-message">⚠️ Please enter a food name.</div>`;
    return;
  }

  resultContainer.innerHTML = `<div class="loader"></div>`;

  try {
    const response = await fetch(
      `https://api.calorieninjas.com/v1/nutrition?query=${encodeURIComponent(query)}`,
      { headers: { "X-Api-Key": CALORIE_NINJAS_KEY } }
    );
    if (!response.ok) throw new Error("Network response was not ok.");

    const data = await response.json();
    if (!data.items || data.items.length === 0) {
      resultContainer.innerHTML = `<div class="error-message">⚠️ No information found. Try another food.</div>`;
      return;
    }

    const food = data.items[0];
    const { name, calories, carbohydrates_total_g, protein_g, fat_total_g } = food;

    // Store latest food globally for logging
    window.latestFood = { calories, carbohydrates_total_g, protein_g, fat_total_g, name };

    resultContainer.innerHTML = `
        <h3>${name.charAt(0).toUpperCase() + name.slice(1)}</h3>
        <div class="nutrition-box">
          <div class="nutrition-row"><span>Calories</span><span>${calories.toFixed(0)} kcal</span></div>
          <div class="nutrition-row"><span>Carbohydrates</span><span>${carbohydrates_total_g.toFixed(1)} g</span></div>
          <div class="nutrition-row"><span>Protein</span><span>${protein_g.toFixed(1)} g</span></div>
          <div class="nutrition-row"><span>Fats</span><span>${fat_total_g.toFixed(1)} g</span></div>
        </div>
        <button class="log-btn">Log Food</button>
    `;

    // Attach click listener dynamically
    const logButton = resultContainer.querySelector(".log-btn");
    logButton.addEventListener("click", async () => {
      await logFoodToSupabase(window.latestFood);
    });
  } catch (err) {
    console.error(err);
    resultContainer.innerHTML = `<div class="error-message">🚫 Failed to fetch data. Please check your connection.</div>`;
  }
}

searchButton?.addEventListener("click", fetchNutrition);
inputField?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") fetchNutrition();
});

// ======================================================================
// 🚀 INITIALIZE
// ======================================================================
document.addEventListener("DOMContentLoaded", async () => {
  updateDateDisplay();
  await updateUserStats();
});
