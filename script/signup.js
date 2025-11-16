import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://aozkyflnpmdktwlnqtqk.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvemt5ZmxucG1ka3R3bG5xdHFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNDgxMzYsImV4cCI6MjA3NzcyNDEzNn0.RuMva444UnUcnWpLYCodttRWFzZqg7pM8XU1_-lnoTg";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirmPassword = document.getElementById("confirm-password").value.trim();

    // Basic validation
    if (!name || !email || !password || !confirmPassword) {
      alert("⚠️ Please fill out all fields.");
      return;
    }

    if (password !== confirmPassword) {
      alert("⚠️ Passwords do not match.");
      return;
    }

    // Sign up user with Supabase Auth
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      alert("❌ Sign-up failed: " + signUpError.message);
      console.error(signUpError);
      return;
    }

    // Insert user info into your custom table
    const { error: insertError } = await supabase
      .from("nutrifit_accounts")
      .insert([
        {
          name: name,
          email: email,
          password: password, // ⚠️ Store securely later (hashed in backend ideally)
        },
      ]);

    if (insertError) {
      console.error("⚠️ Couldn't insert user into nutrifit_accounts:", insertError.message);
      alert("⚠️ Account created, but failed to store in database: " + insertError.message);
      return;
    }

    alert(`✅ Account created successfully for ${email}! Check your inbox to verify.`);
    window.location.href = "/auth.html";
  });
});
