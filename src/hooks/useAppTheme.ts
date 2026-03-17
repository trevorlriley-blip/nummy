import { useTheme } from 'react-native-paper';
import type { AppTheme } from '../theme/paperTheme';

export const useAppTheme = () => useTheme<AppTheme>();
