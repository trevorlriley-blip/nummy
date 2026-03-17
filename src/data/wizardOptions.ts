export interface WizardChipOption {
  value: string;
  label: string;
  icon?: string;
}

export const DAY_OPTIONS: WizardChipOption[] = [
  { value: 'monday', label: 'Mon' },
  { value: 'tuesday', label: 'Tue' },
  { value: 'wednesday', label: 'Wed' },
  { value: 'thursday', label: 'Thu' },
  { value: 'friday', label: 'Fri' },
  { value: 'saturday', label: 'Sat' },
  { value: 'sunday', label: 'Sun' },
];

export const ALL_DAYS = DAY_OPTIONS.map((d) => d.value);

export const REQUEST_TAG_OPTIONS: WizardChipOption[] = [
  { value: 'italian', label: 'Italian', icon: 'pasta' },
  { value: 'quick-meals', label: 'Quick meals', icon: 'clock-fast' },
  { value: 'extra-healthy', label: 'Extra healthy', icon: 'heart-pulse' },
  { value: 'budget-friendly', label: 'Budget-friendly', icon: 'currency-usd' },
  { value: 'high-protein', label: 'High protein', icon: 'arm-flex' },
  { value: 'comfort-food', label: 'Comfort food', icon: 'pot-steam' },
  { value: 'mediterranean', label: 'Mediterranean', icon: 'fish' },
  { value: 'asian', label: 'Asian', icon: 'noodles' },
  { value: 'mexican', label: 'Mexican', icon: 'chili-hot' },
  { value: 'kid-friendly', label: 'Kid-friendly', icon: 'human-child' },
];

export const LOADING_MESSAGES = [
  'Searching through thousands of recipes...',
  'Finding the perfect flavor combinations...',
  'Balancing nutrition and taste...',
  'Making sure everything fits your budget...',
  'Mixing up the variety across the week...',
  'Picking the freshest seasonal ingredients...',
  'Putting the finishing touches on your plan...',
  'Almost there! Just a few more ingredients...',
  'Your personalized menu is coming together...',
  'Crafting something delicious just for you...',
];
