/* Веб-шим @react-navigation/bottom-tabs: таб-навигатор с тем же контрактом
 * (state/descriptors/navigation для кастомного tabBar, ленивый маунт экранов,
 * смонтированные экраны сохраняют состояние — как в react-navigation). */
import React, { useMemo, useRef, useState } from 'react';
import { NavigationContext, type NavigationObject } from './navigation-native';

export type TabRoute = { key: string; name: string };

export type BottomTabBarProps = {
  state: { index: number; routes: TabRoute[] };
  descriptors: Record<string, any>;
  navigation: NavigationObject;
  insets: { top: number; bottom: number; left: number; right: number };
};

type ScreenProps = {
  name: string;
  component: React.ComponentType<any>;
  options?: any;
};

type NavigatorProps = {
  children?: React.ReactNode;
  tabBar?: (props: BottomTabBarProps) => React.ReactNode;
  screenOptions?: {
    headerShown?: boolean;
    sceneStyle?: { backgroundColor?: string; [key: string]: any };
    [key: string]: any;
  };
  initialRouteName?: string;
};

export function createBottomTabNavigator() {
  function Screen(_props: ScreenProps): React.ReactElement | null {
    return null; // декларативный элемент: читается Navigator-ом из children
  }

  function Navigator({ children, tabBar, screenOptions, initialRouteName }: NavigatorProps) {
    const screens: ScreenProps[] = [];
    React.Children.forEach(children, (child) => {
      if (React.isValidElement<ScreenProps>(child) && child.props?.name) {
        screens.push(child.props);
      }
    });

    const initialIndex = Math.max(
      0,
      screens.findIndex((s) => s.name === initialRouteName)
    );
    const [index, setIndex] = useState(initialIndex === -1 ? 0 : initialIndex);
    // ленивый маунт: экран рендерится после первого открытия и остаётся жить
    const mounted = useRef(new Set<number>());
    mounted.current.add(index);

    const routes: TabRoute[] = screens.map((s) => ({ key: s.name, name: s.name }));

    const navigation = useMemo<NavigationObject>(
      () => ({
        navigate: (name: string) => {
          const i = screens.findIndex((s) => s.name === name);
          if (i >= 0) setIndex(i);
        },
        emit: () => ({ defaultPrevented: false }),
      }),
      // список экранов статичен в рамках приложения
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [screens.map((s) => s.name).join('|')]
    );

    const sceneStyle = screenOptions?.sceneStyle ?? {};

    return (
      <NavigationContext.Provider value={navigation}>
        <div style={{ display: 'flex', flex: 1, minHeight: 0, position: 'relative' }}>
          {screens.map((s, i) => {
            if (!mounted.current.has(i)) return null;
            const Comp = s.component;
            return (
              <div
                key={s.name}
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: i === index ? 'flex' : 'none',
                  flexDirection: 'column',
                  backgroundColor: sceneStyle.backgroundColor,
                }}
              >
                <Comp />
              </div>
            );
          })}
          {tabBar?.({
            state: { index, routes },
            descriptors: {},
            navigation,
            insets: { top: 0, bottom: 0, left: 0, right: 0 },
          })}
        </div>
      </NavigationContext.Provider>
    );
  }

  return { Navigator, Screen };
}
