(function (root) {
  const DEFAULTS = {
    workouts: [],
    stats: { completedWorkouts: 0, completedSets: 0, lastActive: '', streak: 0 },
    history: [],
    settings: {
      weeklyGoal: 4,
      onboarded: false,
      watchBridgeUrl: '',
      watchLiveEnabled: false,
      watchToken: '',
      hrAlertThreshold: 170,
    },
  };

  function load() {
    return {
      workouts: JSON.parse(localStorage.getItem('fitopro.workouts') || JSON.stringify(DEFAULTS.workouts)),
      stats: JSON.parse(localStorage.getItem('fitopro.stats') || JSON.stringify(DEFAULTS.stats)),
      history: JSON.parse(localStorage.getItem('fitopro.history') || JSON.stringify(DEFAULTS.history)),
      settings: {
        ...DEFAULTS.settings,
        ...JSON.parse(localStorage.getItem('fitopro.settings') || JSON.stringify(DEFAULTS.settings)),
      },
    };
  }

  function persist(state) {
    localStorage.setItem('fitopro.workouts', JSON.stringify(state.workouts));
    localStorage.setItem('fitopro.stats', JSON.stringify(state.stats));
    localStorage.setItem('fitopro.history', JSON.stringify(state.history));
    localStorage.setItem('fitopro.settings', JSON.stringify(state.settings));
  }

  const api = { load, persist, DEFAULTS };
  root.FitState = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
