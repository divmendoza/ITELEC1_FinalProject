import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://aozkyflnpmdktwlnqtqk.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvemt5ZmxucG1ka3R3bG5xdHFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNDgxMzYsImV4cCI6MjA3NzcyNDEzNn0.RuMva444UnUcnWpLYCodttRWFzZqg7pM8XU1_-lnoTg";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  // ✅ Always clear input fields on load
  form.reset();
  emailInput.value = "";
  passwordInput.value = "";

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
      alert("⚠️ Please fill out both email and password.");
      return;
    }

    // ✅ Try to sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log("Login result:", data, error);

    if (error) {
      alert("❌ Login failed: " + error.message);
      return;
    }

    // ✅ Successful login
    // ✅ Save user ID locally for later
    localStorage.setItem("user_id", data.id);
    localStorage.setItem("user", JSON.stringify(data.user));
    window.location.href = "/dashboard.html";
  });
});
