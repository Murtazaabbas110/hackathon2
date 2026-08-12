export function calculateComplexity({ requirements = [], ambiguities = [], risks = [], dependencies = [] }) {
  const requirementsCount = requirements.length || 0;
  const signals = (ambiguities.length || 0) + (risks.length || 0) + (dependencies.length || 0);

  if (requirementsCount > 15 || signals > 10) return "HIGH";
  if (requirementsCount > 7 || signals > 4) return "MEDIUM";
  return "LOW";
}
