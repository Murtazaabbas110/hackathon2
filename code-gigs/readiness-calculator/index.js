export function calculateReadiness({ ambiguities = [], risks = [], dependencies = [] }) {
  let readiness = 100;
  readiness -= (ambiguities.length || 0) * 4;
  readiness -= (risks.length || 0) * 5;
  readiness -= (dependencies.length || 0) * 3;
  return Math.max(0, Math.min(100, readiness));
}
