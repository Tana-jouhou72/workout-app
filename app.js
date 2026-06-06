// Core Workout Routine Data Structure
const DEFAULT_ROUTINE = {
  Mon: {
    name: "Monday",
    subtitle: "Chest, Shoulder & Tricep Day",
    exercises: [
      { name: "Bench Press", sets: 3, reps: 12, category: "chest" },
      { name: "Dumbbell Overhead press", sets: 3, reps: 12, category: "shoulder" },
      { name: "Incline Bench press", sets: 3, reps: 12, category: "chest" },
      { name: "Lateral Raise", sets: 4, reps: 15, category: "shoulder" },
      { name: "Tricep Rope pushdown", sets: 3, reps: 12, category: "tricep" }
    ]
  },
  Tue: {
    name: "Tuesday",
    subtitle: "Back, Shoulder, Bicep & Abs Day",
    exercises: [
      { name: "Lat Pulldown", sets: 4, reps: 12, category: "back" },
      { name: "Seated Cable Row", sets: 3, reps: 12, category: "back" },
      { name: "Facepull", sets: 3, reps: 15, category: "shoulder" },
      { name: "Bicep Curl", sets: 3, reps: 12, category: "bicep" },
      { name: "hang leg raise", sets: 3, reps: 10, category: "abs" }
    ]
  },
  Wed: {
    name: "Wednesday",
    subtitle: "Active Rest & Recovery Day",
    exercises: []
  },
  Thu: {
    name: "Thursday",
    subtitle: "Shoulder, Bicep & Tricep Day",
    exercises: [
      { name: "Machine Shoulder Press", sets: 3, reps: 12, category: "shoulder" },
      { name: "Lateral Raise", sets: 4, reps: 15, category: "shoulder" },
      { name: "Rear delt fly", sets: 3, reps: 12, category: "shoulder" },
      { name: "Bicep curl", sets: 3, reps: 12, category: "bicep" },
      { name: "Dumbbell overhead extension", sets: 3, reps: 10, category: "tricep" }
    ]
  },
  Fri: {
    name: "Friday",
    subtitle: "Active Rest & Recovery Day",
    exercises: []
  },
  Sat: {
    name: "Saturday",
    subtitle: "Chest, Back, Shoulder & Bicep Day",
    exercises: [
      { name: "Incline Bench press", sets: 3, reps: 12, category: "chest" },
      { name: "Lat Pulldown", sets: 3, reps: 12, category: "back" },
      { name: "Cable lateral raise", sets: 3, reps: 12, category: "shoulder" },
      { name: "Hammer curl", sets: 3, reps: 12, category: "bicep" }
    ]
  },
  Sun: {
    name: "Sunday",
    subtitle: "Full Rest & Recovery Day",
    exercises: []
  }
};

const DAYS_ABBR = {
  Mon: "MON",
  Tue: "TUE",
  Wed: "WED",
  Thu: "THU",
  Fri: "FRI",
  Sat: "SAT",
  Sun: "SUN"
};

// State Management
let currentDay = getTodayAbbr();
let routine = JSON.parse(localStorage.getItem('flexflow_routine')) || DEFAULT_ROUTINE;
// Key format: completedSets[dateString][`${exerciseName}-${setNumber}`] = true;
let completedSets = JSON.parse(localStorage.getItem('flexflow_completed_sets')) || {};

// Timer State
let timerInterval = null;
let timerSecondsTotal = 120;
let timerSecondsRemaining = 0;

// Calendar View State
let calendarDate = new Date();

// DOM Elements
const timelineGrid = document.getElementById('timeline-grid');
const activeDayName = document.getElementById('active-day-name');
const activeDaySubtitle = document.getElementById('active-day-subtitle');
const volumeBreakdown = document.getElementById('volume-breakdown');
const exercisesList = document.getElementById('exercises-list');
const statsCompleted = document.getElementById('stats-completed');
const btnResetDay = document.getElementById('btn-reset-day');
const btnAddExercise = document.getElementById('btn-add-exercise');
const btnCompleteDay = document.getElementById('btn-complete-day');
const btnUndoDay = document.getElementById('btn-undo-day');

// Navigation DOM
const navWorkout = document.getElementById('nav-workout');
const navHistory = document.getElementById('nav-history');
const workoutSection = document.getElementById('workout-section');
const weeklyTimeline = document.getElementById('weekly-timeline');
const historySection = document.getElementById('history-section');

// Calendar DOM
const calendarDays = document.getElementById('calendar-days');
const currentMonthYear = document.getElementById('current-month-year');
const btnPrevMonth = document.getElementById('btn-prev-month');
const btnNextMonth = document.getElementById('btn-next-month');

// Timer DOM Elements
const timerWidget = document.getElementById('timer-widget');
const timerDisplay = document.getElementById('timer-display');
const timerProgress = document.getElementById('timer-progress');
const timerSub10 = document.getElementById('timer-sub-10');
const timerAdd10 = document.getElementById('timer-add-10');
const timerSkip = document.getElementById('timer-skip');
const timerChime = document.getElementById('timer-chime');

// Modal DOM Elements
const exerciseModal = document.getElementById('exercise-modal');
const modalTitle = document.getElementById('modal-title');
const exerciseForm = document.getElementById('exercise-form');
const editExerciseIndex = document.getElementById('edit-exercise-index');
const inputExerciseName = document.getElementById('input-exercise-name');
const inputExerciseSets = document.getElementById('input-exercise-sets');
const inputExerciseReps = document.getElementById('input-exercise-reps');
const inputExerciseCategory = document.getElementById('input-exercise-category');
const modalClose = document.getElementById('modal-close');
const modalCancel = document.getElementById('modal-cancel');

// Initialization
function init() {
  renderTimeline();
  loadDay(currentDay);
  updateStats();
  setupEventListeners();
}

// Helper: Get today's day abbreviation (Mon-Sun)
function getTodayAbbr() {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const todayIndex = new Date().getDay();
  return days[todayIndex];
}

// Helper: Format Date object to YYYY-MM-DD
function getTodayDateString(date = new Date()) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Helper: Get date of the weekday in the current week (Monday-start)
function getDateOfDayOfCurrentWeek(dayAbbr) {
  const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const targetIndex = dayOrder.indexOf(dayAbbr);
  
  const today = new Date();
  let todayDayIndex = today.getDay() - 1; // 0 for Mon, 5 for Sat
  if (todayDayIndex === -1) todayDayIndex = 6; // 6 for Sun
  
  const diff = targetIndex - todayDayIndex;
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + diff);
  return getTodayDateString(targetDate);
}

// Render the 7-day timeline top bar
function renderTimeline() {
  timelineGrid.innerHTML = '';
  Object.keys(DEFAULT_ROUTINE).forEach(dayKey => {
    const dayData = routine[dayKey];
    const isRest = dayData.exercises.length === 0;
    const isToday = dayKey === getTodayAbbr();

    const card = document.createElement('div');
    card.className = `day-card ${dayKey === currentDay ? 'active' : ''} ${isRest ? 'rest-day' : ''}`;
    card.dataset.day = dayKey;

    const nameSpan = document.createElement('span');
    nameSpan.className = 'day-abbr';
    nameSpan.textContent = DAYS_ABBR[dayKey];

    const labelSpan = document.createElement('span');
    labelSpan.className = 'day-name';
    labelSpan.textContent = isToday ? 'TODAY' : dayKey;

    card.appendChild(nameSpan);
    card.appendChild(labelSpan);

    if (!isRest) {
      const dot = document.createElement('div');
      dot.className = 'badge-indicator';
      card.appendChild(dot);
    }

    card.addEventListener('click', () => {
      document.querySelector('.day-card.active')?.classList.remove('active');
      card.classList.add('active');
      loadDay(dayKey);
    });

    timelineGrid.appendChild(card);
  });
}

// Load exercise list and volume data for a specific day
function loadDay(dayKey) {
  currentDay = dayKey;
  const dayData = routine[dayKey];
  
  activeDayName.textContent = dayData.name;
  activeDaySubtitle.textContent = dayData.subtitle;

  renderVolume(dayData.exercises);
  renderExercises(dayData.exercises);
  updateStats();
}

// Render Muscle Volume badges
function renderVolume(exercises) {
  volumeBreakdown.innerHTML = '';
  
  if (exercises.length === 0) {
    volumeBreakdown.style.display = 'none';
    return;
  }
  
  volumeBreakdown.style.display = 'flex';
  
  const categories = {};
  exercises.forEach(ex => {
    categories[ex.category] = (categories[ex.category] || 0) + 1;
  });

  Object.entries(categories).forEach(([category, count]) => {
    const badge = document.createElement('span');
    badge.className = `volume-badge ${category}`;
    badge.textContent = `${category} x${count}`;
    volumeBreakdown.appendChild(badge);
  });
}

// Render Exercises checklist cards
function renderExercises(exercises) {
  exercisesList.innerHTML = '';

  if (exercises.length === 0) {
    exercisesList.innerHTML = `
      <div class="rest-state">
        <span class="rest-icon">☕</span>
        <h3>Rest and Recover</h3>
        <p>No workouts scheduled for today. Allow your muscles to repair and grow!</p>
      </div>
    `;
    return;
  }

  const dateStr = getDateOfDayOfCurrentWeek(currentDay);

  exercises.forEach((ex, exIndex) => {
    const card = document.createElement('div');
    card.className = 'exercise-card';
    card.dataset.index = exIndex;

    const info = document.createElement('div');
    info.className = 'exercise-info';

    const titleRow = document.createElement('div');
    titleRow.className = 'exercise-title-row';

    const name = document.createElement('span');
    name.className = 'exercise-name';
    name.textContent = ex.name;

    const tag = document.createElement('span');
    tag.className = `category-tag ${ex.category}`;
    tag.textContent = ex.category;

    titleRow.appendChild(name);
    titleRow.appendChild(tag);

    const meta = document.createElement('span');
    meta.className = 'exercise-meta';
    meta.textContent = `${ex.sets} Sets x ${ex.reps} Reps`;

    info.appendChild(titleRow);
    info.appendChild(meta);

    // Sets Grid
    const setsGrid = document.createElement('div');
    setsGrid.className = 'sets-grid';

    for (let setNum = 1; setNum <= ex.sets; setNum++) {
      const setKey = `${ex.name}-${setNum}`;
      const isCompleted = completedSets[dateStr] && completedSets[dateStr][setKey];

      const bubble = document.createElement('button');
      bubble.className = `set-bubble ${isCompleted ? 'completed' : ''}`;
      bubble.textContent = setNum;
      
      bubble.addEventListener('click', () => {
        toggleSet(dateStr, setKey, bubble);
      });
      setsGrid.appendChild(bubble);
    }

    const actions = document.createElement('div');
    actions.className = 'card-actions';

    const btnEdit = document.createElement('button');
    btnEdit.className = 'btn-edit-icon';
    btnEdit.innerHTML = '✏️';
    btnEdit.title = 'Edit Exercise';
    btnEdit.addEventListener('click', () => openModal(exIndex));

    const btnDelete = document.createElement('button');
    btnDelete.className = 'btn-danger-icon';
    btnDelete.innerHTML = '🗑️';
    btnDelete.title = 'Delete Exercise';
    btnDelete.addEventListener('click', () => deleteExercise(exIndex));

    actions.appendChild(btnEdit);
    actions.appendChild(btnDelete);

    card.appendChild(info);
    card.appendChild(setsGrid);
    card.appendChild(actions);

    exercisesList.appendChild(card);
  });
}

// Toggle Set completion and handle timer
function toggleSet(dateStr, setKey, bubble) {
  if (!completedSets[dateStr]) {
    completedSets[dateStr] = {};
  }

  const isCompleted = !completedSets[dateStr][setKey];
  
  if (isCompleted) {
    completedSets[dateStr][setKey] = true;
    bubble.classList.add('completed');
    startTimer(120); // 120s rest timer
  } else {
    delete completedSets[dateStr][setKey];
    if (Object.keys(completedSets[dateStr]).length === 0) {
      delete completedSets[dateStr];
    }
    bubble.classList.remove('completed');
  }

  localStorage.setItem('flexflow_completed_sets', JSON.stringify(completedSets));
  updateStats();
}

// Update stats header (completed sets today)
function updateStats() {
  const dateStr = getDateOfDayOfCurrentWeek(currentDay);
  const completedCount = completedSets[dateStr] ? Object.keys(completedSets[dateStr]).length : 0;
  statsCompleted.textContent = completedCount;
}

// Reset day's progress
function resetDayProgress() {
  const dateStr = getDateOfDayOfCurrentWeek(currentDay);
  if (confirm(`Reset all sets for ${routine[currentDay].name} (${dateStr})?`)) {
    delete completedSets[dateStr];
    localStorage.setItem('flexflow_completed_sets', JSON.stringify(completedSets));
    loadDay(currentDay);
    updateStats();
    stopTimer();
  }
}

// Complete the entire current day
function completeCurrentDay() {
  const dayData = routine[currentDay];
  if (!dayData || dayData.exercises.length === 0) return;
  
  const dateStr = getDateOfDayOfCurrentWeek(currentDay);
  if (!completedSets[dateStr]) {
    completedSets[dateStr] = {};
  }
  
  dayData.exercises.forEach(ex => {
    for (let setNum = 1; setNum <= ex.sets; setNum++) {
      const setKey = `${ex.name}-${setNum}`;
      completedSets[dateStr][setKey] = true;
    }
  });
  
  localStorage.setItem('flexflow_completed_sets', JSON.stringify(completedSets));
  loadDay(currentDay);
}

// Undo completing the current day
function undoCompleteCurrentDay() {
  const dayData = routine[currentDay];
  if (!dayData || dayData.exercises.length === 0) return;
  
  const dateStr = getDateOfDayOfCurrentWeek(currentDay);
  if (completedSets[dateStr]) {
    dayData.exercises.forEach(ex => {
      for (let setNum = 1; setNum <= ex.sets; setNum++) {
        const setKey = `${ex.name}-${setNum}`;
        delete completedSets[dateStr][setKey];
      }
    });
    
    if (Object.keys(completedSets[dateStr]).length === 0) {
      delete completedSets[dateStr];
    }
    
    localStorage.setItem('flexflow_completed_sets', JSON.stringify(completedSets));
    loadDay(currentDay);
  }
}

// Timer Logic
function startTimer(duration) {
  stopTimer();
  timerSecondsTotal = duration;
  timerSecondsRemaining = duration;
  
  timerWidget.classList.remove('hidden');
  updateTimerDisplay();

  timerInterval = setInterval(() => {
    timerSecondsRemaining--;
    if (timerSecondsRemaining <= 0) {
      playTimerNotification();
      stopTimer();
    } else {
      updateTimerDisplay();
    }
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  timerWidget.classList.add('hidden');
}

function updateTimerDisplay() {
  timerDisplay.textContent = timerSecondsRemaining;
  const ringCircumference = 213.6;
  const offset = ringCircumference - (ringCircumference * timerSecondsRemaining) / timerSecondsTotal;
  timerProgress.style.strokeDashoffset = offset;
}

function playTimerNotification() {
  try {
    timerChime.play();
  } catch (err) {
    console.log("Audio play blocked: ", err);
  }
  
  if ('vibrate' in navigator) {
    navigator.vibrate([200, 100, 200]);
  }
}

// Calendar View Drawing Logic
function renderCalendar() {
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  currentMonthYear.textContent = `${monthNames[month]} ${year}`;
  
  calendarDays.innerHTML = '';
  
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Padding cells
  for (let i = 0; i < firstDayIndex; i++) {
    const emptyCell = document.createElement('div');
    emptyCell.className = 'calendar-day-cell empty-cell';
    calendarDays.appendChild(emptyCell);
  }
  
  // Day cells
  for (let day = 1; day <= daysInMonth; day++) {
    const cell = document.createElement('div');
    cell.className = 'calendar-day-cell';
    cell.textContent = day;
    
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    // Highlight worked days
    const hasWorkouts = completedSets[dateStr] && Object.keys(completedSets[dateStr]).length > 0;
    if (hasWorkouts) {
      cell.classList.add('worked-day');
    }
    
    // Highlight today
    const todayStr = getTodayDateString(new Date());
    if (dateStr === todayStr) {
      cell.classList.add('today-cell');
    }
    
    cell.addEventListener('click', () => {
      selectHistoryDay(dateStr, hasWorkouts);
      document.querySelector('.calendar-day-cell.selected')?.classList.remove('selected');
      cell.classList.add('selected');
    });
    
    calendarDays.appendChild(cell);
  }
}

// Render history detail pane on day click
function selectHistoryDay(dateStr, hasWorkouts) {
  const detailsDate = document.getElementById('history-details-date');
  const detailsContent = document.getElementById('history-details-content');
  
  const dateParts = dateStr.split('-');
  const d = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  detailsDate.textContent = d.toLocaleDateString('en-US', options);
  
  if (!hasWorkouts) {
    detailsContent.innerHTML = `
      <p class="text-muted">No workout data recorded for this date. ☕ Rest day!</p>
    `;
    return;
  }
  
  const dayCompletions = completedSets[dateStr];
  detailsContent.innerHTML = '';
  
  const list = document.createElement('div');
  list.className = 'history-exercise-list';
  
  const groupedCompletions = {};
  Object.keys(dayCompletions).forEach(key => {
    const parts = key.split('-');
    const exName = parts[0];
    const setNum = parts[1];
    
    if (!groupedCompletions[exName]) {
      groupedCompletions[exName] = [];
    }
    groupedCompletions[exName].push(setNum);
  });
  
  Object.entries(groupedCompletions).forEach(([exName, sets]) => {
    sets.sort((a, b) => parseInt(a) - parseInt(b));
    
    const item = document.createElement('div');
    item.className = 'history-exercise-item';
    
    const nameSpan = document.createElement('span');
    nameSpan.className = 'history-ex-name';
    nameSpan.textContent = exName;
    
    const setsSpan = document.createElement('span');
    setsSpan.className = 'history-ex-sets';
    setsSpan.textContent = `Sets: ${sets.join(', ')}`;
    
    item.appendChild(nameSpan);
    item.appendChild(setsSpan);
    list.appendChild(item);
  });
  
  detailsContent.appendChild(list);
}

// Modal Form handling (Add/Edit)
function openModal(index = -1) {
  exerciseModal.classList.remove('hidden');
  
  if (index === -1) {
    modalTitle.textContent = 'Add Exercise';
    editExerciseIndex.value = '';
    inputExerciseName.value = '';
    inputExerciseSets.value = 3;
    inputExerciseReps.value = 12;
    inputExerciseCategory.value = 'chest';
  } else {
    const ex = routine[currentDay].exercises[index];
    modalTitle.textContent = 'Edit Exercise';
    editExerciseIndex.value = index;
    inputExerciseName.value = ex.name;
    inputExerciseSets.value = ex.sets;
    inputExerciseReps.value = ex.reps;
    inputExerciseCategory.value = ex.category;
  }
}

function closeModal() {
  exerciseModal.classList.add('hidden');
}

function handleFormSubmit(e) {
  e.preventDefault();
  
  const index = editExerciseIndex.value;
  const newEx = {
    name: inputExerciseName.value.trim(),
    sets: parseInt(inputExerciseSets.value),
    reps: parseInt(inputExerciseReps.value),
    category: inputExerciseCategory.value
  };

  if (index === '') {
    routine[currentDay].exercises.push(newEx);
  } else {
    routine[currentDay].exercises[index] = newEx;
  }

  saveRoutine();
  closeModal();
  loadDay(currentDay);
}

function deleteExercise(index) {
  if (confirm(`Are you sure you want to delete ${routine[currentDay].exercises[index].name}?`)) {
    routine[currentDay].exercises.splice(index, 1);
    saveRoutine();
    loadDay(currentDay);
  }
}

function saveRoutine() {
  localStorage.setItem('flexflow_routine', JSON.stringify(routine));
}

// Setup Event Listeners
function setupEventListeners() {
  btnResetDay.addEventListener('click', resetDayProgress);
  btnAddExercise.addEventListener('click', () => openModal(-1));
  btnCompleteDay.addEventListener('click', completeCurrentDay);
  btnUndoDay.addEventListener('click', undoCompleteCurrentDay);
  modalClose.addEventListener('click', closeModal);
  modalCancel.addEventListener('click', closeModal);
  exerciseForm.addEventListener('submit', handleFormSubmit);

  // Tab Navigation Links
  navWorkout.addEventListener('click', () => {
    navWorkout.classList.add('active');
    navHistory.classList.remove('active');
    workoutSection.classList.remove('hidden');
    weeklyTimeline.classList.remove('hidden');
    historySection.classList.add('hidden');
  });

  navHistory.addEventListener('click', () => {
    navWorkout.classList.remove('active');
    navHistory.classList.add('active');
    workoutSection.classList.add('hidden');
    weeklyTimeline.classList.add('hidden');
    historySection.classList.remove('hidden');
    renderCalendar();
  });

  // Calendar Month Navigation
  btnPrevMonth.addEventListener('click', () => {
    calendarDate.setMonth(calendarDate.getMonth() - 1);
    renderCalendar();
  });

  btnNextMonth.addEventListener('click', () => {
    calendarDate.setMonth(calendarDate.getMonth() + 1);
    renderCalendar();
  });

  // Timer Widget Controls
  timerSkip.addEventListener('click', stopTimer);
  timerSub10.addEventListener('click', () => {
    timerSecondsRemaining = Math.max(0, timerSecondsRemaining - 10);
    if (timerSecondsRemaining === 0) stopTimer();
    else updateTimerDisplay();
  });
  timerAdd10.addEventListener('click', () => {
    timerSecondsRemaining += 10;
    timerSecondsTotal += 10;
    updateTimerDisplay();
  });

  exerciseModal.addEventListener('click', (e) => {
    if (e.target === exerciseModal) closeModal();
  });
}

// Run application
init();
