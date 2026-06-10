import { COLOR_OPTIONS } from '../../theme';
import type { Profile, ProfilePreferences } from './types';

export const DEFAULT_PROFILE: Profile = {
  name: 'Пользователь',
  email: '',
  tier: 'free',
  avatarIcon: 'person',
  avatarColor: COLOR_OPTIONS[2], // фиолетовый, как на скрине
};

export const DEFAULT_PREFERENCES: ProfilePreferences = {
  themeMode: 'dark',
  autoDistributeIncome: false,
  overspendAlerts: true,
  overspendThresholdPct: 80,
};
