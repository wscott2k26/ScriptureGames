import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs
      detachInactiveScreens={false}
      screenOptions={{
        headerShown: false,
        lazy: true,
        freezeOnBlur: false,
        popToTopOnBlur: false,
        tabBarStyle: { display: 'none' },
      }}
    >
      <Tabs.Screen name="journey" options={{ title: 'Journey' }} />
      <Tabs.Screen name="quiz" options={{ title: 'Games' }} />
      <Tabs.Screen name="bible" options={{ title: 'Bible' }} />
      <Tabs.Screen name="companion" options={{ title: 'Lumi' }} />
      <Tabs.Screen name="command" options={{ title: 'Home' }} />
      <Tabs.Screen name="preferences" options={{ title: 'Settings' }} />
      <Tabs.Screen name="stories" options={{ href: null }} />
    </Tabs>
  );
}
