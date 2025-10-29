import { createDrawerNavigator } from '@react-navigation/drawer';
import { useColorScheme } from 'react-native';
import { colors } from '@/constants/colors';
import { DrawerContent } from '@/components/DrawerContent';
import ChatScreen from '@/app/chat';

const Drawer = createDrawerNavigator();

export default function RootLayout() {
  const colorScheme = useColorScheme() || 'light';
  const theme = colors[colorScheme];

  return (
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
  );
}
