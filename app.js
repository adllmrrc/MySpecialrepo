const form = document.getElementById('workout-form');
const workoutList = document.getElementById('workout-list');
const currentTask = document.getElementById('current-task');
const timerEl = document.getElementById('timer');
const startBtn = document.getElementById('start-btn');
const nextBtn = document.getElementById('next-btn');
const resetBtn = document.getElementById('reset-btn');
const completedWorkoutsEl = document.getElementById('completed-workouts');
const completedSetsEl = document.getElementById('completed-sets');
const streakEl = document.getElementById('streak');
const suggestionEl = document.getElementById('suggestion');
const challengeEl = document.getElementById('challenge');

const state = {
  workouts: JSON.parse(localStorage.getItem('fitopro.workouts') || '[]'),
  stats: JSON.parse(localStorage.getItem('fitopro.stats') || '{"completedWorkouts":0,"completedSets":0,"lastActive":"","streak":0}'),
  currentWorkoutIndex: 0,
  currentSet: 0,
  secondsLeft: 0,
  timerId: null,
  running: false,
};

function save() {
  localStorage.setItem('fitopro.workouts', JSON.stringify(state.workouts));
  localStorage.setItem('fitopro.stats', JSON.stringify(state.stats));
}

function updateStatsView() {
  completedWorkoutsEl.textContent = state.stats.completedWorkouts;
  completedSetsEl.textContent = state.stats.completedSets;
  streakEl.textContent = state.stats.streak;
}

function updateSuggestion() {
  if (!state.workouts.length) {
    suggestionEl.textContent = "Ajoutez des exercices pour recevoir des conseils personnalisés.";
    return;
  }

  const avgReps = state.workouts.reduce((acc, w) => acc + w.reps, 0) / state.workouts.length;
  if (avgReps < 12) {
    suggestionEl.textContent = "Suggestion: augmentez progressivement à 12-15 répétitions pour améliorer l'endurance.";
  } else if (avgReps <= 20) {
    suggestionEl.textContent = "Suggestion: excellent rythme. Ajoutez une série supplémentaire pour continuer à progresser.";
  } else {
    suggestionEl.textContent = "Suggestion: volume élevé détecté. Pensez à intégrer des jours de récupération active.";
  }
}

function updateChallenge() {
  if (state.stats.completedSets >= 50) {
    challengeEl.textContent = 'Défi élite: terminez 5 séries avec 60 secondes de gainage.';
  } else if (state.stats.completedSets >= 20) {
    challengeEl.textContent = 'Défi intermédiaire: ajoutez 1 série bonus sur votre exercice favori.';
  } else {
    challengeEl.textContent = 'Défi du jour: complétez 3 séries sans interruption.';
  }
}

function renderWorkouts() {
  workoutList.innerHTML = '';
  state.workouts.forEach((w, index) => {
    const li = document.createElement('li');
    li.textContent = `${w.exercise} • ${w.reps} reps × ${w.sets} séries (${w.duration}s)`;

    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Supprimer';
    removeBtn.style.marginLeft = '0.5rem';
    removeBtn.addEventListener('click', () => {
      state.workouts.splice(index, 1);
      save();
      renderWorkouts();
      updateSuggestion();
    });

    li.appendChild(removeBtn);
    workoutList.appendChild(li);
  });

  updateSuggestion();
}

function pad(val) {
  return String(val).padStart(2, '0');
}

function renderTimer() {
  const minutes = Math.floor(state.secondsLeft / 60);
  const seconds = state.secondsLeft % 60;
  timerEl.textContent = `${pad(minutes)}:${pad(seconds)}`;
}

function activeWorkout() {
  return state.workouts[state.currentWorkoutIndex];
}

function stopTimer() {
  if (state.timerId) clearInterval(state.timerId);
  state.timerId = null;
  state.running = false;
}

function markActiveDay() {
  const today = new Date().toISOString().slice(0, 10);
  const yesterdayDate = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  if (!state.stats.lastActive) {
    state.stats.streak = 1;
  } else if (state.stats.lastActive === today) {
    return;
  } else if (state.stats.lastActive === yesterdayDate) {
    state.stats.streak += 1;
  } else {
    state.stats.streak = 1;
  }

  state.stats.lastActive = today;
}

function startSession() {
  if (!state.workouts.length) {
    alert('Ajoutez au moins un exercice avant de démarrer.');
    return;
  }

  const workout = activeWorkout();
  state.secondsLeft = workout.duration;
  state.currentSet = 1;
  currentTask.textContent = `${workout.exercise} • Série ${state.currentSet}/${workout.sets}`;
  renderTimer();

  stopTimer();
  state.running = true;
  nextBtn.disabled = false;
  state.timerId = setInterval(() => {
    state.secondsLeft -= 1;
    renderTimer();
    if (state.secondsLeft <= 0) {
      stopTimer();
      currentTask.textContent = 'Série terminée ! Cliquez sur "Valider la série".';
    }
  }, 1000);
}

function validateSet() {
  const workout = activeWorkout();
  if (!workout) return;

  state.stats.completedSets += 1;

  if (state.currentSet < workout.sets) {
    state.currentSet += 1;
    state.secondsLeft = workout.duration;
    currentTask.textContent = `${workout.exercise} • Série ${state.currentSet}/${workout.sets}`;
    renderTimer();

    stopTimer();
    state.running = true;
    state.timerId = setInterval(() => {
      state.secondsLeft -= 1;
      renderTimer();
      if (state.secondsLeft <= 0) {
        stopTimer();
        currentTask.textContent = 'Série terminée ! Cliquez sur "Valider la série".';
      }
    }, 1000);
  } else {
    state.stats.completedWorkouts += 1;
    markActiveDay();

    if (state.currentWorkoutIndex < state.workouts.length - 1) {
      state.currentWorkoutIndex += 1;
      state.currentSet = 0;
      currentTask.textContent = 'Exercice terminé. Démarrez le suivant.';
      state.secondsLeft = 0;
      renderTimer();
      stopTimer();
      startSession();
    } else {
      currentTask.textContent = 'Programme terminé ✅ Bravo !';
      state.currentWorkoutIndex = 0;
      state.currentSet = 0;
      state.secondsLeft = 0;
      renderTimer();
      stopTimer();
      nextBtn.disabled = true;
    }
  }

  updateStatsView();
  updateChallenge();
  save();
}

function resetSession() {
  stopTimer();
  state.currentWorkoutIndex = 0;
  state.currentSet = 0;
  state.secondsLeft = 0;
  renderTimer();
  currentTask.textContent = 'Séance réinitialisée. Prêt à repartir !';
  nextBtn.disabled = true;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const workout = {
    exercise: document.getElementById('exercise').value.trim(),
    reps: Number(document.getElementById('reps').value),
    sets: Number(document.getElementById('sets').value),
    duration: Number(document.getElementById('duration').value),
  };

  if (!workout.exercise) return;

  state.workouts.push(workout);
  form.reset();
  document.getElementById('reps').value = 10;
  document.getElementById('sets').value = 3;
  document.getElementById('duration').value = 45;

  save();
  renderWorkouts();
});

startBtn.addEventListener('click', startSession);
nextBtn.addEventListener('click', validateSet);
resetBtn.addEventListener('click', resetSession);

renderTimer();
renderWorkouts();
updateStatsView();
updateChallenge();
