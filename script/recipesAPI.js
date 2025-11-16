// ======================================================================
// 🔑 API KEYS b8e8291c7a2f41a5a8e9e30b62c722d9
// ======================================================================
const SPOONACULAR_KEY = "0ac17410e7764f24ace3bed4264e0928";

// ======================================================================
// 🍽️ SPOONACULAR — RECIPE FETCHING & DISPLAY
// ======================================================================

// Select main elements
const recipeContainer = document.querySelector(".recipe-container");
const leftArrow = document.querySelector(".recipe-arrow-left");
const rightArrow = document.querySelector(".recipe-arrow-right");

const mealType = document.querySelector(".meal-type");
const cuisineType = document.querySelector(".cuisine-type");
const dietType = document.querySelector(".diet-type");
const maxCaloriesInput = document.querySelector(".calorie-max");

let allRecipes = []; // All fetched recipes
let currentIndex = 0; // Current position in recipe list
const recipesPerPage = 3; // Show only 3 at a time

// ======================================================================
// 🔹 Build Spoonacular API URL based on user parameters
// ======================================================================
function buildURL() {
  const meal = mealType.value && mealType.value !== "Meal Type" ? `&type=${mealType.value.toLowerCase()}` : "";
  const cuisine = cuisineType.value && cuisineType.value !== "Cuisine" ? `&cuisine=${cuisineType.value.toLowerCase()}` : "";
  const diet = dietType.value && dietType.value !== "Diet Type" ? `&diet=${dietType.value.toLowerCase()}` : "";
  const maxCalories = maxCaloriesInput.value ? `&maxCalories=${maxCaloriesInput.value}` : "";

  // Spoonacular complexSearch endpoint
  return `https://api.spoonacular.com/recipes/complexSearch?apiKey=${SPOONACULAR_KEY}&number=20&addRecipeInformation=true${meal}${cuisine}${diet}${maxCalories}`;
}

// ======================================================================
// 🔹 Fetch Recipes from Spoonacular
// ======================================================================
async function fetchRecipes() {
  try {
    
    recipeContainer.classList.add("loading");
    recipeContainer.innerHTML = `<div class="loader"></div>`;
    const response = await fetch(buildURL());
    if (!response.ok) throw new Error("Failed to fetch recipes");

    const data = await response.json();
    allRecipes = data.results || [];

    if (allRecipes.length === 0) {
      recipeContainer.innerHTML = `<p style="color:red;">⚠️ No recipes found for selected filters.</p>`;
      return;
    }

    currentIndex = 0; // Reset index
    displayRecipes();
  } catch (error) {
    console.error("Error fetching recipes:", error);
    recipeContainer.innerHTML = `<p style="color:red;">⚠️ Failed to load recipes.</p>`;
  }
}

// ======================================================================
// 🔹 Display 3 Recipes at a Time
// ======================================================================
function displayRecipes() {
    recipeContainer.classList.remove("loading");

  recipeContainer.innerHTML = ""; // Clear previous recipes
  const visibleRecipes = allRecipes.slice(currentIndex, currentIndex + recipesPerPage);

  visibleRecipes.forEach((recipe) => {
    const card = document.createElement("div");
    card.classList.add("recipe-card");

    card.innerHTML = `
      <img src="${recipe.image}" alt="${recipe.title}">
      <div class="recipe-info">
          <h3>${recipe.title}</h3>
          <p>${recipe.summary
            ? recipe.summary.replace(/<[^>]*>?/gm, "").slice(0, 100) + "..."
            : "No description available."}</p>
          <button class="recipe-btn" onclick="window.open('${recipe.sourceUrl}', '_blank')">
              <p>View Recipe</p>
              <span class="material-symbols-rounded card-btn">arrow_forward_ios</span>
          </button>
      </div>
    `;

    recipeContainer.appendChild(card);
  });

  // Enable/disable arrows
  leftArrow.disabled = currentIndex === 0;
  rightArrow.disabled = currentIndex + recipesPerPage >= allRecipes.length;
}

// ======================================================================
// 🔹 Navigation Buttons
// ======================================================================
leftArrow.addEventListener("click", () => {
  if (currentIndex > 0) {
    currentIndex -= recipesPerPage;
    displayRecipes();
  }
});

rightArrow.addEventListener("click", () => {
  if (currentIndex + recipesPerPage < allRecipes.length) {
    currentIndex += recipesPerPage;
    displayRecipes();
  }
});

// ======================================================================
// 🔹 Fetch recipes when user changes parameters
// ======================================================================
[mealType, cuisineType, dietType, maxCaloriesInput].forEach(el =>
  el.addEventListener("change", fetchRecipes)
);

maxCaloriesInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") fetchRecipes();
});

// ======================================================================
// 🚀 Initialize on Page Load
// ======================================================================
document.addEventListener("DOMContentLoaded", () => {
  fetchRecipes(); // Default load
});
