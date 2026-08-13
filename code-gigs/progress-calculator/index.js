const ACTIVE_STATUSES = ["TODO", "IN_PROGRESS", "REVIEW"];
const COMPLETE_STATUSES = ["DONE"];

function clamp(value) {
  return Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
}

export function calculateKanbanProgress(items = []) {
  const total = items.length;
  if (!total) return 0;

  const done = items.filter((item) =>
    COMPLETE_STATUSES.includes(item.status),
  ).length;
  return clamp((done / total) * 100);
}

function sprintDone(item) {
  const value = item.sprint_status ?? item.status;
  return COMPLETE_STATUSES.includes(value);
}

export function calculateSprintProgress(items = []) {
  const total = items.length;
  if (!total) return 0;

  const done = items.filter(sprintDone).length;
  return clamp((done / total) * 100);
}

export function calculateProjectProgress(items = []) {
  return calculateKanbanProgress(items);
}

export function countStatuses(items = []) {
  return {
    total: items.length,
    completed: items.filter((item) =>
      COMPLETE_STATUSES.includes(item.status),
    ).length,
    inProgress: items.filter((item) =>
      ACTIVE_STATUSES.includes(item.status),
    ).length,
    remaining: items.filter(
      (item) =>
        !COMPLETE_STATUSES.includes(item.status) &&
        !ACTIVE_STATUSES.includes(item.status),
    ).length,
  };
}
