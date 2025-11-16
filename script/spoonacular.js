const API_KEY = "0ac17410e7764f24ace3bed4264e0928"; // your Spoonacular key

// Target the container with placeholders
const recipeContainer = document.getElementById("recipe-container");

// Dropdowns
const mealType = document.querySelector(".meal-type");
const cuisineType = document.querySelector(".cuisine-type");
const dietType = document.querySelector(".diet-type");
const maxCaloriesInput = document.querySelector(".calorie-max");

// --- Create Recipe Card ---
function createRecipeCard(recipe) {
  return `
    <div class="recipe-card fade-in">
      <img src="${recipe.image}" alt="${recipe.title}">
      <div class="recipe-info">
        <h3>${recipe.title}</h3>
        <p>${recipe.readyInMinutes ? `Ready in ${recipe.readyInMinutes} min | ` : ""}${recipe.servings ? `${recipe.servings} servings` : ""}</p>
        <button class="recipe-btn" onclick="window.open('${recipe.sourceUrl || '#'}', '_blank')">
          <p>View Recipe</p>
          <span class="material-symbols-rounded card-btn">arrow_forward_ios</span>
        </button>
      </div>
    </div>
  `;
}

// --- Fetch Recipes ---
async function fetchRecipes() {
  const meal = mealType.value !== "Meal Type" ? mealType.value : "";
  const cuisine = cuisineType.value !== "Cuisine" ? cuisineType.value : "";
  const diet = dietType.value !== "Diet Type" ? dietType.value : "";
  const maxCalories = maxCaloriesInput.value;

  // 🔹 Replace placeholders with a loader
  recipeContainer.innerHTML = `<div class="loader"></div>`;

  try {
    let url;
    if (maxCalories) {
      url = `https://api.spoonacular.com/recipes/findByNutrients?apiKey=${API_KEY}&number=3&maxCalories=${maxCalories}`;
    } else {
      url = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${API_KEY}&number=3&addRecipeInformation=true&type=${meal}&cuisine=${cuisine}&diet=${diet}`;
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error("Fetch failed");

    const data = await response.json();
    const results = data.results || data;

    // 🔹 Handle no results
    if (!results.length) {
      recipeContainer.innerHTML = `<div class="error-message">⚠️ No recipes found. Try adjusting your filters.</div>`;
      return;
    }

    // 🔹 Replace the 3 placeholder cards with fetched data
    recipeContainer.innerHTML = results.map(createRecipeCard).join("");

  } catch (err) {
    console.error(err);
    recipeContainer.innerHTML = `<div class="error-message">🚫 Error fetching recipes. Please try again later.</div>`;
  }
}

// --- Events ---
[mealType, cuisineType, dietType, maxCaloriesInput].forEach((el) => {
  el.addEventListener("change", fetchRecipes);
});

maxCaloriesInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") fetchRecipes();
});
