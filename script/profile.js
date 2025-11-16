// ===== Supabase Setup =====
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://aozkyflnpmdktwlnqtqk.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvemt5ZmxucG1ka3R3bG5xdHFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNDgxMzYsImV4cCI6MjA3NzcyNDEzNn0.RuMva444UnUcnWpLYCodttRWFzZqg7pM8XU1_-lnoTg";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ===== Fetch Logged-in User Profile =====
async function loadUserProfile() {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.warn("⚠️ No logged-in user found.");
      document.getElementById("userName").textContent = "Guest";
      document.getElementById("userEmail").textContent = "Not logged in";
      return;
    }

    const userEmail = user.email;

    const { data, error } = await supabase
      .from("nutrifit_accounts")
      .select("name, email, height, weight, goal, profile_pic_url")
      .eq("email", userEmail)
      .single();

    if (error) {
      console.error("❌ Error fetching profile:", error.message);
      document.getElementById("userName").textContent = "Unknown User";
      document.getElementById("userEmail").textContent = userEmail;
      return;
    }

    // Populate UI
    document.getElementById("userName").textContent = data.name || "No name found";
    document.getElementById("userEmail").textContent = data.email || userEmail;
    document.getElementById("height").textContent = data.height || "--";
    document.getElementById("weight").textContent = data.weight || "--";
    document.getElementById("goals").textContent = data.goal || "--";

    // Load profile picture
    const profilePic = document.getElementById("profilePic");
    profilePic.src = data.profile_pic_url || "/assets/images/avatar.jpg";
  } catch (err) {
    console.error("❌ Unexpected error:", err);
  }
}

loadUserProfile();

// ===== Edit Profile Modal =====
const editBtn = document.getElementById("editProfileBtn");
const modal = document.getElementById("editProfileModal");
const closeModal = document.querySelector(".closeBtn");
const editForm = document.getElementById("editProfileForm");

editBtn.addEventListener("click", () => {
  modal.style.display = "flex";
});

closeModal.addEventListener("click", () => {
  modal.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === modal) modal.style.display = "none";
});

// ===== Save and Update Profile Info =====
editForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("editName").value.trim();
  const email = document.getElementById("editEmail").value.trim();
  const password = document.getElementById("editPassword").value.trim();
  const height = document.getElementById("editHeight").value.trim();
  const weight = document.getElementById("editWeight").value.trim();
  const goal = document.getElementById("editGoal").value.trim();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      alert("⚠️ No logged-in user found. Please log in first.");
      return;
    }

    const userEmail = user.email;

    const { data: currentData, error: fetchError } = await supabase
      .from("nutrifit_accounts")
      .select("*")
      .eq("email", userEmail)
      .single();

    if (fetchError) {
      console.error("❌ Error fetching current data:", fetchError);
      alert("Failed to load current profile data.");
      return;
    }

    const updatedData = {
      name: name || currentData.name,
      email: email || currentData.email,
      height: height || currentData.height,
      weight: weight || currentData.weight,
      goal: goal || currentData.goal,
    };

    const { error: updateError } = await supabase
      .from("nutrifit_accounts")
      .update(updatedData)
      .eq("email", userEmail);

    if (updateError) {
      console.error("❌ Update failed:", updateError);
      alert("Failed to update profile: " + updateError.message);
      return;
    }

    if (password) await supabase.auth.updateUser({ password });

    document.getElementById("userName").textContent = updatedData.name;
    document.getElementById("userEmail").textContent = updatedData.email;
    document.getElementById("height").textContent = updatedData.height || "--";
    document.getElementById("weight").textContent = updatedData.weight || "--";
    document.getElementById("goals").textContent = updatedData.goal || "--";

    modal.style.display = "none";
  } catch (err) {
    console.error("❌ Unexpected error:", err);
    alert("Something went wrong updating your profile.");
  }
});

// ===== Profile Picture Upload =====
const uploadPic = document.getElementById("uploadPic");
const profilePic = document.getElementById("profilePic");

uploadPic.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      alert("⚠️ Please log in first.");
      return;
    }

    const fileExt = file.name.split(".").pop();
    const filePath = `user_${user.id}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("profile_pics")
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: publicData } = supabase.storage
      .from("profile_pics")
      .getPublicUrl(filePath);

    const publicUrl = publicData.publicUrl;

    const { error: updateError } = await supabase
      .from("nutrifit_accounts")
      .update({ profile_pic_url: publicUrl })
      .eq("email", user.email);

    if (updateError) throw updateError;

    profilePic.src = publicUrl;
    alert("✅ Profile picture updated successfully!");
  } catch (error) {
    console.error("❌ Image upload failed:", error);
    alert("❌ Failed to upload image: " + error.message);
  }
});

// ===== Logout Modal =====
const logoutBtn = document.getElementById("logoutBtn");
const logoutModal = document.getElementById("logoutModal");
const confirmLogoutBtn = document.getElementById("confirmLogout");
const cancelLogoutBtn = document.getElementById("cancelLogout");

logoutBtn.addEventListener("click", () => {
  logoutModal.style.display = "flex";
});

cancelLogoutBtn.addEventListener("click", () => {
  logoutModal.style.display = "none";
});

confirmLogoutBtn.addEventListener("click", async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    alert("❌ Failed to log out: " + error.message);
    return;
  }
  alert("👋 Logged out successfully!");
  localStorage.removeItem("user_id");
  window.location.href = "/auth.html";
});

// ===== Time & Date =====
function updateDateTime() {
  const now = new Date();
  document.getElementById("currentTime").textContent = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  document.getElementById("currentDate").textContent = now.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
setInterval(updateDateTime, 1000);
updateDateTime();

// ===== Weather =====
const city = "Batangas";
fetch(`https://wttr.in/${city}?format=j1`)
  .then((res) => res.json())
  .then((data) => {
    const current = data.current_condition[0];
    const temp = current.temp_C;
    const condition = current.weatherDesc[0].value;

    document.getElementById("temperature").textContent = `${temp}°C`;
    document.getElementById("location").textContent = city;

    const icon = document.getElementById("weatherIcon");
    if (condition.includes("Cloud")) icon.textContent = "cloud";
    else if (condition.includes("Rain")) icon.textContent = "rainy";
    else if (condition.includes("Clear")) icon.textContent = "sunny";
    else if (condition.includes("Thunder")) icon.textContent = "thunderstorm";
    else if (condition.includes("Snow")) icon.textContent = "ac_unit";
    else icon.textContent = "partly_cloudy_day";
  })
  .catch(() => (document.getElementById("temperature").textContent = "N/A"));

// ===== Quick Quote =====
const quickTipEl = document.querySelector(".quickTip p");
function fetchRandomQuote() {
  fetch("https://api.api-ninjas.com/v2/randomquotes", {
    headers: { "X-Api-Key": "x96XrpK06im34BPXEKP7zw==wNFVfQe65zwEKJcj" },
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.length > 0) quickTipEl.textContent = data[0].quote;
    })
    .catch(() => (quickTipEl.textContent = "Stay inspired! Keep going."));
}
fetchRandomQuote();
setInterval(fetchRandomQuote, 30000);
