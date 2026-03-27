const form = document.getElementById('workout-form');
const workoutList = document.getElementById('workout-list');
const historyList = document.getElementById('history-list');
const currentTask = document.getElementById('current-task');
const phaseBadge = document.getElementById('phase-badge');
const timerEl = document.getElementById('timer');
const formError = document.getElementById('form-error');

const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resumeBtn = document.getElementById('resume-btn');
const nextBtn = document.getElementById('next-btn');
const resetBtn = document.getElementById('reset-btn');

const completedWorkoutsEl = document.getElementById('completed-workouts');
const completedSetsEl = document.getElementById('completed-sets');
const streakEl = document.getElementById('streak');
const suggestionEl = document.getElementById('suggestion');
const challengeEl = document.getElementById('challenge');
const badgesEl = document.getElementById('badges');

const weeklyGoalInput = document.getElementById('weekly-goal');
const goalProgress = document.getElementById('goal-progress');

const exportBtn = document.getElementById('export-btn');
const importInput = document.getElementById('import-input');
const clearDataBtn = document.getElementById('clear-data-btn');

const templateBeginnerBtn = document.getElementById('template-beginner');
const templateStrengthBtn = document.getElementById('template-strength');
const templateLossBtn = document.getElementById('template-loss');

const onboarding = document.getElementById('onboarding');
const closeOnboardingBtn = document.getElementById('close-onboarding');
const toastEl = document.getElementById('toast');
const preloadingScreen = document.getElementById('preloading-screen');
const welcomeScreen = document.getElementById('welcome-screen');
const enterAppBtn = document.getElementById('enter-app-btn');
const focusMode = document.getElementById('focus-mode');
const focusTimer = document.getElementById('focus-timer');
const focusTask = document.getElementById('focus-task');
const focusPhase = document.getElementById('focus-phase');
const focusPauseBtn = document.getElementById('focus-pause-btn');
const focusNextBtn = document.getElementById('focus-next-btn');
const focusExitBtn = document.getElementById('focus-exit-btn');
const watchImportInput = document.getElementById('watch-import-input');
const watchStatus = document.getElementById('watch-status');

const dailyChart = document.getElementById('daily-chart');
const exerciseChart = document.getElementById('exercise-chart');

const templates = {
  beginner: [
    { exercise: 'Pompes', reps: 8, sets: 3, duration: 30, rest: 30 },
    { exercise: 'Squats', reps: 12, sets: 3, duration: 40, rest: 30 },
    { exercise: 'Gainage', reps: 1, sets: 3, duration: 30, rest: 30 },
  ],
  strength: [
    { exercise: 'Pompes explosives', reps: 10, sets: 4, duration: 35, rest: 45 },
    { exercise: 'Fentes', reps: 12, sets: 4, duration: 40, rest: 45 },
    { exercise: 'Burpees', reps: 10, sets: 4, duration: 45, rest: 45 },
  ],
  loss: [
    { exercise: 'Jumping Jacks', reps: 30, sets: 4, duration: 45, rest: 20 },
    { exercise: 'Mountain Climbers', reps: 20, sets: 4, duration: 40, rest: 20 },
    { exercise: 'Squat jumps', reps: 15, sets: 4, duration: 40, rest: 20 },
  ],
};

const state = {
  workouts: JSON.parse(localStorage.getItem('fitopro.workouts') || '[]'),
  stats: JSON.parse(localStorage.getItem('fitopro.stats') || '{"completedWorkouts":0,"completedSets":0,"lastActive":"","streak":0}'),
  history: JSON.parse(localStorage.getItem('fitopro.history') || '[]'),
  settings: JSON.parse(localStorage.getItem('fitopro.settings') || '{"weeklyGoal":4,"onboarded":false}'),
  session: {
    workoutIndex: 0,
    setIndex: 0,
    phase: 'idle',
    secondsLeft: 0,
    timerId: null,
    paused: false,
  },
};

function save() {
  localStorage.setItem('fitopro.workouts', JSON.stringify(state.workouts));
  localStorage.setItem('fitopro.stats', JSON.stringify(state.stats));
  localStorage.setItem('fitopro.history', JSON.stringify(state.history));
  localStorage.setItem('fitopro.settings', JSON.stringify(state.settings));
}

function updateStatsView() {
  completedWorkoutsEl.textContent = state.stats.completedWorkouts;
  completedSetsEl.textContent = state.stats.completedSets;
  streakEl.textContent = state.stats.streak;
}

function updateSuggestion() {
  suggestionEl.textContent = FitoLogic.computeSuggestion(state.workouts);
}

function updateChallenge() {
  challengeEl.textContent = FitoLogic.computeChallenge(state.stats.completedSets);
}

function updateBadges() {
  const badges = FitoLogic.computeBadges(state.stats);
  badgesEl.textContent = badges.length ? badges.join(' • ') : 'Aucun badge débloqué pour l\'instant.';
}

function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add('show');
  setTimeout(() => toastEl.classList.remove('show'), 1800);
}

function triggerHaptic() {
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    navigator.vibrate(8);
  }
}

function playSatisfyAnimation(level = 'set') {
  timerEl.classList.remove('pop');
  currentTask.classList.remove('celebrate');
  void timerEl.offsetWidth;
  timerEl.classList.add('pop');
  currentTask.classList.add('celebrate');
  setTimeout(() => {
    currentTask.classList.remove('celebrate');
  }, 650);
  if (level === 'workout') {
    showToast('✨ Excellent ! Séance validée.');
  }
}

function closeWelcomeScreen() {
  welcomeScreen.classList.add('hide');
  welcomeScreen.setAttribute('aria-hidden', 'true');
  showToast('Bienvenue 👋 Bonne séance !');
}

function launchIntroSequence() {
  setTimeout(() => {
    preloadingScreen.classList.add('hide');
    preloadingScreen.setAttribute('aria-hidden', 'true');
    welcomeScreen.classList.remove('hidden-until-load');
    welcomeScreen.setAttribute('aria-hidden', 'false');
  }, 1300);
}

function syncFocusDisplay() {
  focusTimer.textContent = timerEl.textContent;
  focusTask.textContent = currentTask.textContent;
  focusPhase.textContent = `PHASE: ${state.session.phase.toUpperCase()}`;
}

async function openFocusMode() {
  focusMode.classList.remove('hidden-until-load', 'hide');
  focusMode.setAttribute('aria-hidden', 'false');
  syncFocusDisplay();
  try {
    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
      await document.documentElement.requestFullscreen();
    }
  } catch {
    // fallback silently when fullscreen is blocked by browser policy
  }
}

async function closeFocusMode() {
  focusMode.classList.add('hide');
  focusMode.setAttribute('aria-hidden', 'true');
  if (document.fullscreenElement && document.exitFullscreen) {
    try {
      await document.exitFullscreen();
    } catch {
      // noop
    }
  }
}

function parseCsvLine(line) {
  const items = [];
  let current = '';
  let inQuote = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '\"') inQuote = !inQuote;
    else if (ch === ',' && !inQuote) {
      items.push(current.trim());
      current = '';
    } else current += ch;
  }
  items.push(current.trim());
  return items.map((item) => item.replace(/^\"|\"$/g, ''));
}

function importAppleWatchCsv(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const text = String(reader.result || '');
    const lines = text.split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) {
      watchStatus.textContent = 'CSV Apple Watch invalide.';
      return;
    }

    const header = parseCsvLine(lines[0]).map((h) => h.toLowerCase());
    const startIdx = header.findIndex((h) => h.includes('start'));
    const durationIdx = header.findIndex((h) => h.includes('duration'));
    const typeIdx = header.findIndex((h) => h.includes('workout') || h.includes('type'));

    if (startIdx === -1) {
      watchStatus.textContent = 'Colonnes Apple Watch non reconnues (start date manquant).';
      return;
    }

    let imported = 0;
    for (let i = 1; i < lines.length; i += 1) {
      const row = parseCsvLine(lines[i]);
      const dateRaw = row[startIdx];
      if (!dateRaw) continue;
      const day = new Date(dateRaw).toISOString().slice(0, 10);
      const durationMin = Number.parseFloat(row[durationIdx] || '20');
      const workoutName = row[typeIdx] || 'Apple Watch Workout';
      const setsDone = Math.max(1, Math.round((Number.isFinite(durationMin) ? durationMin : 20) / 5));
      state.history.push({ day, workoutName, setsDone, sessions: 1 });
      state.stats.completedWorkouts += 1;
      imported += 1;
    }

    if (imported > 0) {
      save();
      hydrate();
      watchStatus.textContent = `${imported} entraînement(s) Apple Watch importé(s).`;
      showToast('Données Apple Watch importées.');
    } else {
      watchStatus.textContent = 'Aucune ligne valide trouvée dans le CSV.';
    }
  };
  reader.readAsText(file);
}

function workoutCountLast7Days() {
  const cutoff = Date.now() - 6 * 86400000;
  return state.history
    .filter((entry) => new Date(entry.day).getTime() >= cutoff)
    .reduce((acc, entry) => acc + (entry.sessions || 0), 0);
}

function updateWeeklyGoalView() {
  const completed = workoutCountLast7Days();
  const goal = state.settings.weeklyGoal;
  goalProgress.textContent = `${completed} / ${goal} séances cette semaine`;
}

function renderWorkouts() {
  workoutList.innerHTML = '';

  state.workouts.forEach((w, index) => {
    const li = document.createElement('li');
    li.textContent = `${w.exercise} • ${w.reps} reps × ${w.sets} séries (${w.duration}s, repos ${w.rest}s)`;

    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Supprimer';
    removeBtn.style.marginLeft = '0.5rem';
    removeBtn.addEventListener('click', () => {
      state.workouts.splice(index, 1);
      if (state.session.workoutIndex >= state.workouts.length) {
        state.session.workoutIndex = 0;
      }
      save();
      renderWorkouts();
      updateSuggestion();
    });

    li.appendChild(removeBtn);
    workoutList.appendChild(li);
  });
}

function pad(value) {
  return String(value).padStart(2, '0');
}

function renderTimer() {
  const minutes = Math.floor(state.session.secondsLeft / 60);
  const seconds = state.session.secondsLeft % 60;
  timerEl.textContent = `${pad(minutes)}:${pad(seconds)}`;
  syncFocusDisplay();
}

function setPhase(phase) {
  state.session.phase = phase;
  phaseBadge.textContent = `Phase: ${phase}`;
  syncFocusDisplay();
}

function stopTick() {
  if (state.session.timerId) {
    clearInterval(state.session.timerId);
    state.session.timerId = null;
  }
}

function setControlState({ start, pause, resume, next }) {
  startBtn.disabled = start;
  pauseBtn.disabled = pause;
  resumeBtn.disabled = resume;
  nextBtn.disabled = next;
}

function activeWorkout() {
  return state.workouts[state.session.workoutIndex];
}

function markActiveDay() {
  const today = new Date().toISOString().slice(0, 10);
  state.stats.streak = FitoLogic.computeStreak(state.stats.lastActive, today, state.stats.streak);
  state.stats.lastActive = today;
}

function addHistoryEntry(workoutName, setsDone) {
  const day = new Date().toISOString().slice(0, 10);
  state.history.push({
    day,
    workoutName,
    setsDone,
    sessions: 1,
  });

  if (state.history.length > 500) {
    state.history = state.history.slice(-500);
  }
}

function renderHistory() {
  const grouped = {};
  state.history.forEach((entry) => {
    if (!grouped[entry.day]) grouped[entry.day] = { sets: 0, sessions: 0 };
    grouped[entry.day].sets += entry.setsDone;
    grouped[entry.day].sessions += entry.sessions || 0;
  });

  const days = Object.keys(grouped).sort().slice(-7).reverse();
  historyList.innerHTML = '';

  if (!days.length) {
    const li = document.createElement('li');
    li.textContent = 'Aucun historique pour le moment.';
    historyList.appendChild(li);
    return;
  }

  days.forEach((day) => {
    const li = document.createElement('li');
    li.textContent = `${day} • ${grouped[day].sessions} séance(s) • ${grouped[day].sets} séries`;
    historyList.appendChild(li);
  });
}

function drawBars(canvas, labels, values, color) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const w = canvas.width;
  const h = canvas.height;

  if (!labels.length) {
    ctx.fillStyle = '#6b7280';
    ctx.font = '14px sans-serif';
    ctx.fillText('Pas encore de données.', 20, 30);
    return;
  }

  const maxValue = Math.max(...values, 1);
  const barAreaWidth = w - 60;
  const barWidth = Math.max(18, Math.floor(barAreaWidth / labels.length) - 8);

  labels.forEach((label, index) => {
    const x = 40 + index * (barWidth + 8);
    const barHeight = Math.round((values[index] / maxValue) * (h - 70));
    const y = h - 30 - barHeight;

    ctx.fillStyle = color;
    ctx.fillRect(x, y, barWidth, barHeight);

    ctx.fillStyle = '#1f2937';
    ctx.font = '12px sans-serif';
    ctx.fillText(String(values[index]), x, y - 6);
    ctx.fillText(label.slice(5, 10), x, h - 10);
  });
}

function renderCharts() {
  const dailyGrouped = {};
  state.history.forEach((entry) => {
    dailyGrouped[entry.day] = (dailyGrouped[entry.day] || 0) + entry.setsDone;
  });

  const dailyLabels = Object.keys(dailyGrouped).sort().slice(-7);
  const dailyValues = dailyLabels.map((d) => dailyGrouped[d]);
  drawBars(dailyChart, dailyLabels, dailyValues, '#2563eb');

  const byExercise = {};
  state.history.forEach((entry) => {
    byExercise[entry.workoutName] = (byExercise[entry.workoutName] || 0) + entry.setsDone;
  });

  const topExercises = Object.entries(byExercise)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  drawBars(
    exerciseChart,
    topExercises.map((x) => x[0]),
    topExercises.map((x) => x[1]),
    '#0ea5e9'
  );
}

function startTick() {
  stopTick();
  state.session.paused = false;
  setControlState({ start: true, pause: false, resume: true, next: true });

  state.session.timerId = setInterval(() => {
    state.session.secondsLeft -= 1;
    renderTimer();

    if (state.session.secondsLeft <= 0) {
      stopTick();
      state.session.secondsLeft = 0;
      renderTimer();
      currentTask.textContent = 'Temps écoulé. Cliquez sur "Valider" pour continuer.';
      setControlState({ start: true, pause: true, resume: true, next: false });
    }
  }, 1000);
}

function startSession() {
  triggerHaptic();
  if (!state.workouts.length) {
    showToast('Ajoutez au moins un exercice avant de démarrer.');
    return;
  }

  const workout = activeWorkout();
  state.session.setIndex = 1;
  state.session.secondsLeft = workout.duration;
  setPhase('exercice');
  currentTask.textContent = `${workout.exercise} • Série ${state.session.setIndex}/${workout.sets}`;
  renderTimer();
  openFocusMode();
  startTick();
}

function pauseSession() {
  triggerHaptic();
  if (!state.session.timerId) return;
  stopTick();
  state.session.paused = true;
  currentTask.textContent = 'Pause en cours…';
  setControlState({ start: true, pause: true, resume: false, next: true });
}

function resumeSession() {
  triggerHaptic();
  if (!state.session.paused || state.session.secondsLeft <= 0) return;
  currentTask.textContent = 'Session reprise.';
  startTick();
}

function validateStep() {
  triggerHaptic();
  const workout = activeWorkout();
  if (!workout) return;
  if (state.session.secondsLeft > 0) return;

  if (state.session.phase === 'exercice') {
    state.stats.completedSets += 1;
    playSatisfyAnimation('set');

    if (state.session.setIndex < workout.sets) {
      setPhase('repos');
      state.session.secondsLeft = workout.rest;
      currentTask.textContent = `Repos avant série ${state.session.setIndex + 1}/${workout.sets}`;
      renderTimer();
      startTick();
      save();
      updateStatsView();
      updateChallenge();
      return;
    }

    state.stats.completedWorkouts += 1;
    playSatisfyAnimation('workout');
    addHistoryEntry(workout.exercise, workout.sets);
    markActiveDay();

    if (state.session.workoutIndex < state.workouts.length - 1) {
      state.session.workoutIndex += 1;
      const nextWorkout = activeWorkout();
      state.session.setIndex = 1;
      state.session.secondsLeft = nextWorkout.duration;
      setPhase('exercice');
      currentTask.textContent = `${nextWorkout.exercise} • Série ${state.session.setIndex}/${nextWorkout.sets}`;
      renderTimer();
      startTick();
    } else {
      setPhase('terminé');
      currentTask.textContent = 'Programme terminé ✅ Bravo !';
      state.session.workoutIndex = 0;
      state.session.setIndex = 0;
      state.session.secondsLeft = 0;
      renderTimer();
      setControlState({ start: false, pause: true, resume: true, next: true });
      closeFocusMode();
    }
  } else if (state.session.phase === 'repos') {
    setPhase('exercice');
    state.session.setIndex += 1;
    state.session.secondsLeft = workout.duration;
    currentTask.textContent = `${workout.exercise} • Série ${state.session.setIndex}/${workout.sets}`;
    renderTimer();
    startTick();
  }

  updateStatsView();
  updateChallenge();
  updateBadges();
  updateWeeklyGoalView();
  renderHistory();
  renderCharts();
  save();
}

function resetSession() {
  triggerHaptic();
  stopTick();
  state.session.workoutIndex = 0;
  state.session.setIndex = 0;
  state.session.secondsLeft = 0;
  state.session.phase = 'idle';
  state.session.paused = false;
  renderTimer();
  setPhase('attente');
  currentTask.textContent = 'Séance réinitialisée. Prêt à repartir !';
  setControlState({ start: false, pause: true, resume: true, next: true });
  closeFocusMode();
}

function applyTemplate(name) {
  triggerHaptic();
  const chosen = templates[name];
  if (!chosen) return;
  state.workouts = chosen.map((item) => ({ ...item }));
  save();
  renderWorkouts();
  updateSuggestion();
  showToast('Template appliqué.');
}

function exportData() {
  const payload = {
    workouts: state.workouts,
    stats: state.stats,
    history: state.history,
    settings: state.settings,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'fitopro-export.json';
  link.click();
  URL.revokeObjectURL(link.href);
  showToast('Export JSON téléchargé.');
}

function importData(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result));
      const safe = FitoLogic.sanitizeImportData(parsed);
      state.workouts = safe.workouts;
      state.history = safe.history;
      state.stats = safe.stats;
      state.settings = safe.settings;
      save();
      hydrate();
      showToast('Import réussi.');
    } catch {
      showToast('Fichier JSON invalide.');
    }
  };
  reader.readAsText(file);
}

function clearAllData() {
  const ok = confirm('Confirmation: cette action supprimera définitivement toutes vos données locales FitoPro. Continuer ?');
  if (!ok) return;
  localStorage.removeItem('fitopro.workouts');
  localStorage.removeItem('fitopro.stats');
  localStorage.removeItem('fitopro.history');
  localStorage.removeItem('fitopro.settings');
  state.workouts = [];
  state.stats = { completedWorkouts: 0, completedSets: 0, lastActive: '', streak: 0 };
  state.history = [];
  state.settings = { weeklyGoal: 4, onboarded: true };
  resetSession();
  hydrate();
  showToast('Données locales supprimées.');
}

function hydrate() {
  weeklyGoalInput.value = state.settings.weeklyGoal;
  renderTimer();
  renderWorkouts();
  renderHistory();
  renderCharts();
  updateStatsView();
  updateSuggestion();
  updateChallenge();
  updateBadges();
  updateWeeklyGoalView();
}

function initOnboarding() {
  if (!state.settings.onboarded) {
    onboarding.classList.add('show');
    onboarding.setAttribute('aria-hidden', 'false');
  }
}

function closeOnboarding() {
  state.settings.onboarded = true;
  onboarding.classList.remove('show');
  onboarding.setAttribute('aria-hidden', 'true');
  save();
  showToast('Bienvenue sur FitoPro !');
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  formError.textContent = '';

  const workout = {
    exercise: document.getElementById('exercise').value.trim(),
    reps: Number.parseInt(document.getElementById('reps').value, 10),
    sets: Number.parseInt(document.getElementById('sets').value, 10),
    duration: Number.parseInt(document.getElementById('duration').value, 10),
    rest: Number.parseInt(document.getElementById('rest').value, 10),
  };

  const errorMessage = FitoLogic.validateWorkoutInput(workout);
  if (errorMessage) {
    formError.textContent = errorMessage;
    return;
  }

  state.workouts.push(workout);
  form.reset();
  document.getElementById('reps').value = 10;
  document.getElementById('sets').value = 3;
  document.getElementById('duration').value = 45;
  document.getElementById('rest').value = 30;

  save();
  renderWorkouts();
  updateSuggestion();
  showToast('Exercice ajouté au programme.');
});

weeklyGoalInput.addEventListener('change', () => {
  const value = Number.parseInt(weeklyGoalInput.value, 10);
  state.settings.weeklyGoal = Number.isInteger(value) && value > 0 ? value : 4;
  weeklyGoalInput.value = state.settings.weeklyGoal;
  save();
  updateWeeklyGoalView();
});

startBtn.addEventListener('click', startSession);
pauseBtn.addEventListener('click', pauseSession);
resumeBtn.addEventListener('click', resumeSession);
nextBtn.addEventListener('click', validateStep);
resetBtn.addEventListener('click', resetSession);
focusPauseBtn.addEventListener('click', pauseSession);
focusNextBtn.addEventListener('click', validateStep);
focusExitBtn.addEventListener('click', closeFocusMode);

exportBtn.addEventListener('click', exportData);
importInput.addEventListener('change', (event) => importData(event.target.files[0]));
clearDataBtn.addEventListener('click', clearAllData);
watchImportInput.addEventListener('change', (event) => importAppleWatchCsv(event.target.files[0]));

templateBeginnerBtn.addEventListener('click', () => applyTemplate('beginner'));
templateStrengthBtn.addEventListener('click', () => applyTemplate('strength'));
templateLossBtn.addEventListener('click', () => applyTemplate('loss'));

closeOnboardingBtn.addEventListener('click', closeOnboarding);
enterAppBtn.addEventListener('click', closeWelcomeScreen);

setPhase('attente');
setControlState({ start: false, pause: true, resume: true, next: true });
hydrate();
initOnboarding();
launchIntroSequence();
