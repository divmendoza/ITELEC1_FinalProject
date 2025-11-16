// === nav.js ===
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://aozkyflnpmdktwlnqtqk.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvemt5ZmxucG1ka3R3bG5xdHFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNDgxMzYsImV4cCI6MjA3NzcyNDEzNn0.RuMva444UnUcnWpLYCodttRWFzZqg7pM8XU1_-lnoTg";

const supabase = createClient(supabaseUrl, supabaseKey);

// === Fetch and display profile image ===
async function loadProfileImage() {
  try {
    // ✅ Get currently logged-in user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.warn("⚠️ No user logged in, redirecting...");
      window.location.href = "login.html";
      return;
    }

    const userEmail = user.email;

    // ✅ Get profile image from your Supabase table
    const { data, error } = await supabase
      .from("nutrifit_accounts")
      .select("profile_pic_url")
      .eq("email", userEmail)
      .single();

    if (error) {
      console.error("❌ Error fetching profile image:", error.message);
      return;
    }

    const profileImg = document.getElementById("profileNavPic");

    if (data?.profile_pic_url) {
      // ✅ Use Supabase public bucket URL directly
      profileImg.src = data.profile_pic_url;
    } else {
      // ❗ Fallback to default
      profileImg.src = "";
    }

    // ✅ Style to ensure proper display
    profileImg.style.width = "45px";
    profileImg.style.height = "45px";
    profileImg.style.borderRadius = "50%";
    profileImg.style.objectFit = "cover";

    console.log("✅ Profile image loaded successfully.");
  } catch (err) {
    console.error("❌ Unexpected error loading profile image:", err);
  }
}

// === Run on page load ===
document.addEventListener("DOMContentLoaded", loadProfileImage);
