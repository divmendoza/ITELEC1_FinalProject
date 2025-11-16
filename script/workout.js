document.addEventListener('DOMContentLoaded', () => {
  const stepsElems = Array.from(document.querySelectorAll('.form-step'));
  const progressBar = document.getElementById('w-progress');
  const circles = Array.from(document.querySelectorAll('.w-circle'));
  const prevButtons = Array.from(document.querySelectorAll('.w-prev'));
  const nextButtons = Array.from(document.querySelectorAll('.w-next'));
  const generateBtns = Array.from(document.querySelectorAll('.generate-btn'));
  const muscleCards = Array.from(document.querySelectorAll('.muscle-card'));
  const range = document.getElementById('duration-range');
  const valueDisplay = document.getElementById('duration-value');

  // Modal elements
  const modal = document.getElementById('workout-modal');
  const closeModal = document.querySelector('.close-modal');
  const workoutList = document.getElementById('workout-list');

  // --- API Config ---
  const EXERCISE_API = "https://exercisedb.p.rapidapi.com/exercises";
  const EXERCISE_HEADERS = {
    "x-rapidapi-key": "4f04837fd1msh3c09f680d1bf56ep1cc753jsn0935e9419945",
    "x-rapidapi-host": "exercisedb.p.rapidapi.com"
  };

  // --- State ---
  let currentStep = stepsElems.findIndex(s => s.classList.contains('active'));
  if (currentStep === -1) currentStep = 0;

  const selected = {
    goal: "",
    level: "",
    duration: 5,
    muscles: new Set()
  };

  // --- Step control ---
  function showStep(index) {
    stepsElems.forEach((s, i) => s.classList.toggle('active', i === index));
    currentStep = index;
    const percent = (index / (stepsElems.length - 1)) * 100;
    progressBar.style.width = `${percent}%`;
    circles.forEach((c, i) => c.classList.toggle('active', i <= index));

    prevButtons.forEach(btn => btn.disabled = (index === 0));
    nextButtons.forEach(btn => btn.style.display = (index === stepsElems.length - 1 ? 'none' : ''));
    generateBtns.forEach(btn => btn.style.display = (index === stepsElems.length - 1 ? '' : 'none'));
  }

  showStep(currentStep);

  // --- Button Handlers ---
  prevButtons.forEach(btn => btn.addEventListener('click', e => {
    e.preventDefault();
    showStep(currentStep - 1);
  }));

  nextButtons.forEach(btn => btn.addEventListener('click', e => {
    e.preventDefault();
    showStep(currentStep + 1);
  }));

  // --- Step 1: Goal selection ---
  document.querySelectorAll('.goal-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.goal-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      selected.goal = card.querySelector('span').textContent.trim();
    });
  });

  // --- Step 2: Level selection ---
  document.querySelectorAll('.level-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.level-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      selected.level = card.querySelector('span').textContent.trim();
    });
  });

  // --- Step 3: Duration ---
  if (range && valueDisplay) {
    valueDisplay.textContent = `${range.value} mins`;
    range.addEventListener('input', () => {
      valueDisplay.textContent = `${range.value} mins`;
      selected.duration = range.value;
    });
  }

  // --- Step 4: Muscle selection ---
  muscleCards.forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('active');
      const name = card.querySelector('span').textContent.trim().toLowerCase();
      if (card.classList.contains('active')) {
        selected.muscles.add(name);
      } else {
        selected.muscles.delete(name);
      }
    });
  });

  // --- Generate button handler ---
  generateBtns.forEach(btn => {
    btn.addEventListener('click', async e => {
      e.preventDefault();
      if (selected.muscles.size === 0) {
        alert("Please select at least one muscle group!");
        return;
      }
      await generateWorkout();
    });
  });

  // --- Generate workout ---
  async function generateWorkout() {
    workoutList.innerHTML = "<p>Loading exercises...</p>";
    modal.style.display = "flex";

    const allExercises = [];

    const MUSCLE_MAP = {
      "back": "back",
      "lower arms": "lower arms",
      "upper arms": "upper arms",
      "shoulders": "shoulders",
      "upper legs": "upper legs",
      "lower legs": "lower legs",
      "waist": "waist",
      "neck": "neck"
    };

    for (const muscle of selected.muscles) {
      const mapped = MUSCLE_MAP[muscle] || muscle;
      try {
        const res = await fetch(`${EXERCISE_API}/bodyPart/${mapped}`, { headers: EXERCISE_HEADERS });
        const data = await res.json();
        allExercises.push(...data);
      } catch (error) {
        console.error("Error fetching exercises for:", mapped, error);
      }
    }

    workoutList.innerHTML = "";

    if (!allExercises.length) {
      workoutList.innerHTML = "<p>No exercises found. Try different muscles.</p>";
      return;
    }

    // --- Render exercises as expandable cards with numbered steps ---
    allExercises.forEach(ex => {
      const card = document.createElement('div');
      card.classList.add('exercise-card');

      const exerciseName = ex.name.charAt(0).toUpperCase() + ex.name.slice(1);

      // Make steps numbered
      const stepsArr = ex.instructions || [];
      let instructionsHtml = "";
      if (stepsArr.length > 0) {
        instructionsHtml = "<ol class='instruction-list'>" +
          stepsArr.map(step => `<li>${step}</li>`).join("") +
          "</ol>";
      } else {
        instructionsHtml = `<p>No step-by-step instructions available. Use equipment: ${ex.equipment}, target: ${ex.target}.</p>`;
      }

      card.innerHTML = `
        <div class="card-header">
          <h4>${exerciseName}</h4>
          <span class="toggle-steps">▼</span>
        </div>
        <div class="exercise-steps">
          <p><strong>Body Part:</strong> ${ex.bodyPart}</p>
          <p><strong>Equipment:</strong> ${ex.equipment}</p>
          <p><strong>Target:</strong> ${ex.target}</p>
          <div class="instructions-container">
            <h3>How to perform:</h3>
            ${instructionsHtml}
          </div>
        </div>
      `;

      const stepsDiv = card.querySelector('.exercise-steps');
      stepsDiv.style.maxHeight = "0";
      stepsDiv.style.overflow = "hidden";
      stepsDiv.style.transition = "max-height 0.4s ease, padding 0.4s ease";

      card.querySelector('.card-header').addEventListener('click', () => {
        const isOpen = stepsDiv.style.maxHeight !== "0px";
        if (isOpen) {
          stepsDiv.style.maxHeight = "0";
          stepsDiv.style.padding = "0 0";
          card.querySelector('.toggle-steps').textContent = "▼";
        } else {
          document.querySelectorAll('.exercise-card .exercise-steps').forEach(div => {
            div.style.maxHeight = "0";
            div.style.padding = "0 0";
            const toggle = div.closest('.exercise-card').querySelector('.toggle-steps');
            if (toggle) toggle.textContent = "▼";
          });

          stepsDiv.style.padding = "10px 0";
          stepsDiv.style.maxHeight = stepsDiv.scrollHeight + "px";
          card.querySelector('.toggle-steps').textContent = "▲";
        }
      });

      workoutList.appendChild(card);
    });
  }

  // --- Close modal ---
  closeModal.addEventListener('click', () => (modal.style.display = "none"));
  window.addEventListener('click', e => {
    if (e.target === modal) modal.style.display = "none";
  });
});
