import { createDrawerNavigator } from '@react-navigation/drawer';
import { useColorScheme } from 'react-native';
import { useEffect } from 'react';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { colors } from '@/constants/colors';
import { DrawerContent } from '@/components/DrawerContent';
import ChatScreen from '@/app/chat';
import { useAppStore } from '@/store/useAppStore';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const Drawer = createDrawerNavigator();

export default function RootLayout() {
  const colorScheme = useColorScheme() || 'light';
  const theme = colors[colorScheme];
  const loadBaseURL = useAppStore(s => s.loadBaseURL);

  // Load persisted baseURL on app init
  useEffect(() => {
    loadBaseURL();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <Drawer.Navigator
          drawerContent={(props) => <DrawerContent {...props} />}
          screenOptions={{
            headerStyle: {
              backgroundColor: theme.bg,
            },
            headerTintColor: theme.text,
            headerTitleStyle: {
              color: theme.text,
              fontWeight: '600',
            },
            headerShadowVisible: false,
            drawerStyle: {
              backgroundColor: theme.bg,
              width: 280,
            },
          }}
        >
          <Drawer.Screen
            name="chat"
            component={ChatScreen}
            options={{
              title: 'Chat',
              drawerLabel: 'Chat',
            }}
          />
        </Drawer.Navigator>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
