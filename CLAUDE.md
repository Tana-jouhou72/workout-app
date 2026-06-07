# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the App

No build system. Open `index.html` directly in a browser:

```
open index.html
```

There is no package.json, no npm, no bundler, and no test suite.

## Architecture

A single-page vanilla JS workout tracker. Three files:

- `index.html` — structure and two views (Workout, History); elements identified by IDs
- `app.js` — all application logic, state, and event handling
- `style.css` — dark glassmorphism design; CSS variables for theming and category colors

### State

All mutable state lives in two `localStorage` keys:

- `flexflow_routine` — the weekly exercise schedule (7 days). Defaults to `DEFAULT_ROUTINE` in `app.js` if absent.
- `flexflow_completed_sets` — a nested object keyed by `YYYY-MM-DD` date string, then by `${exerciseName}-${setNumber}` string. Example: `{ "2026-06-07": { "Bench Press-1": true, "Bench Press-2": true } }`.

### Set key format

Set keys are `"${ex.name}-${setNumber}"` — the dash separates exercise name from set number. The history view parses these with `key.split('-')` taking index `[0]` as the name and `[1]` as the set number, which means exercise names containing a dash will be misread in the history detail pane.

### Date handling

- `getTodayDateString(date)` — formats any Date to `YYYY-MM-DD`.
- `getDateOfDayOfCurrentWeek(dayAbbr)` — maps a day abbreviation (`Mon`–`Sun`) to the actual calendar date of that day in the current week (Monday-anchored). The workout view always operates on the current week's dates; there is no concept of viewing a past week.

### Views

- **Workout view** — shows weekly timeline + day detail. `loadDay(dayKey)` is the main entry point to re-render a day.
- **History view** — calendar rendered by `renderCalendar()`. Navigating months only changes `calendarDate`; workout data is read directly from `completedSets`.

### Timer

Auto-starts at 120 seconds whenever a set bubble is marked complete. The floating timer widget is hidden via a `.hidden` CSS class with `opacity:0` + `pointer-events:none`.

### Category system

Eight muscle group categories: `chest`, `back`, `shoulder`, `bicep`, `tricep`, `legs`, `abs`, `cardio`. Each has a dedicated CSS variable (`--cat-chest`, etc.) and matching classes on `.volume-badge` and `.category-tag` elements. Adding a new category requires updating both the `<select>` in `index.html` and the CSS rules in `style.css`.
