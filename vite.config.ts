import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Код приложения написан в нотации React Native и не меняется —
// все RN/Expo-модули подменяются на локальные веб-шимы (чистый React).
const shim = (name: string) => path.resolve(__dirname, `src/shims/${name}`);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'react-native': shim('react-native'),
      'react-native-svg': shim('react-native-svg'),
      'react-native-gesture-handler': shim('gesture-handler'),
      'react-native-safe-area-context': shim('safe-area-context'),
      '@react-native-async-storage/async-storage': shim('async-storage'),
      '@react-navigation/native': shim('navigation-native'),
      '@react-navigation/bottom-tabs': shim('navigation-bottom-tabs'),
      'expo-linear-gradient': shim('expo-linear-gradient'),
      'expo-status-bar': shim('expo-status-bar'),
      '@expo/vector-icons': shim('vector-icons'),
    },
  },
  server: {
    port: 5173,
  },
});
