import FontAwesome from '@expo/vector-icons/FontAwesome';
import { withLayoutContext } from 'expo-router';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/hooks/useAppTheme';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { Navigator } = createMaterialTopTabNavigator();
const MaterialTopTabs = withLayoutContext(Navigator);

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={22} {...props} />;
}

export default function AppLayout() {
  const { t } = useTranslation();
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <MaterialTopTabs
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: isDark ? '#9CA3AF' : '#6B7280',
          tabBarStyle: {
            backgroundColor: colors.card,
            elevation: 0,
            shadowOpacity: 0,
            borderTopWidth: 1,
            borderTopColor: isDark ? '#374151' : '#E5E7EB',
            paddingBottom: insets.bottom,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '600',
            textTransform: 'none',
          },
          tabBarIndicatorStyle: {
            backgroundColor: colors.primary,
            height: 3,
            top: 0,
          },
          tabBarShowIcon: true,
          swipeEnabled: true,
          animationEnabled: true,
          tabBarScrollEnabled: false,
        }}
        tabBarPosition="bottom"
      >
        <MaterialTopTabs.Screen
          name="home"
          options={{
            title: t('tabs.home'),
            tabBarIcon: ({ color }: { color: string }) => <TabBarIcon name="home" color={color} />,
          }}
        />
        <MaterialTopTabs.Screen
          name="recipes"
          options={{
            title: t('tabs.recipes'),
            tabBarIcon: ({ color }: { color: string }) => <TabBarIcon name="book" color={color} />,
          }}
        />
        <MaterialTopTabs.Screen
          name="weekly-plan"
          options={{
            title: t('tabs.plan'),
            tabBarIcon: ({ color }: { color: string }) => <TabBarIcon name="calendar" color={color} />,
          }}
        />
        <MaterialTopTabs.Screen
          name="shopping-list"
          options={{
            title: t('tabs.shopping'),
            tabBarIcon: ({ color }: { color: string }) => <TabBarIcon name="shopping-cart" color={color} />,
          }}
        />
        <MaterialTopTabs.Screen
          name="pantry"
          options={{
            title: t('tabs.pantry'),
            tabBarIcon: ({ color }: { color: string }) => <TabBarIcon name="archive" color={color} />,
          }}
        />
      </MaterialTopTabs>
    </View>
  );
}
