const TAG_DESCRIPTIONS: Record<string, string> = {
  italian: 'Italian-inspired dishes',
  'quick-meals': 'quick meals under 30 minutes',
  'extra-healthy': 'extra healthy and nutritious options',
  'budget-friendly': 'budget-friendly recipes',
  'high-protein': 'high-protein meals',
  'comfort-food': 'cozy comfort food',
  mediterranean: 'Mediterranean cuisine',
  asian: 'Asian-inspired dishes',
  mexican: 'Mexican-inspired dishes',
  'kid-friendly': 'kid-friendly meals',
};

export function buildWizardPrompt(
  selectedDays: string[],
  selectedTags: string[],
  customPrompt: string,
  weekStartDate: string,
): string {
  const dayNames = selectedDays.map(
    (d) => d.charAt(0).toUpperCase() + d.slice(1)
  );

  let prompt: string;
  if (selectedDays.length === 7) {
    prompt = `Plan meals for every day of the week starting ${weekStartDate} (Monday through Sunday).`;
  } else {
    prompt = `Plan meals for these days of the week starting ${weekStartDate}: ${dayNames.join(', ')}.`;
  }

  if (selectedTags.length > 0) {
    const descriptions = selectedTags.map((t) => TAG_DESCRIPTIONS[t] || t);
    prompt += ` I'd like ${descriptions.join(', ')}.`;
  }

  if (customPrompt.trim()) {
    prompt += ` Also: ${customPrompt.trim()}`;
  }

  prompt +=
    ' Please generate the meal plan right away without asking any questions.';

  return prompt;
}
