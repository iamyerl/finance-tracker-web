/* Веб-шим @react-navigation/native: контейнер, тема и useNavigation. */
import React, { createContext, useContext } from 'react';

export type NavTheme = {
  dark: boolean;
  colors: {
    primary: string;
    background: string;
    card: string;
    text: string;
    border: string;
    notification: string;
  };
};

export const DefaultTheme: NavTheme = {
  dark: false,
  colors: {
    primary: 'rgb(0, 122, 255)',
    background: 'rgb(242, 242, 242)',
    card: 'rgb(255, 255, 255)',
    text: 'rgb(28, 28, 30)',
    border: 'rgb(216, 216, 216)',
    notification: 'rgb(255, 59, 48)',
  },
};

export const DarkTheme: NavTheme = {
  dark: true,
  colors: {
    primary: 'rgb(10, 132, 255)',
    background: 'rgb(1, 1, 1)',
    card: 'rgb(18, 18, 18)',
    text: 'rgb(229, 229, 231)',
    border: 'rgb(39, 39, 41)',
    notification: 'rgb(255, 69, 58)',
  },
};

export type NavigationObject = {
  navigate: (name: never | string) => void;
  emit: (event: { type: string; target?: string; canPreventDefault?: boolean }) => {
    defaultPrevented: boolean;
  };
};

export const NavigationContext = createContext<NavigationObject>({
  navigate: () => {},
  emit: () => ({ defaultPrevented: false }),
});

export function useNavigation(): NavigationObject {
  return useContext(NavigationContext);
}

export const ThemeContext = createContext<NavTheme>(DefaultTheme);

export function NavigationContainer({
  children,
  theme,
}: {
  children?: React.ReactNode;
  theme?: NavTheme;
}) {
  return (
    <ThemeContext.Provider value={theme ?? DefaultTheme}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: 0,
          position: 'relative',
          backgroundColor: theme?.colors.background,
        }}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
