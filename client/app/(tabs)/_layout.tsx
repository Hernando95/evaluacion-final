import { Tabs } from 'expo-router';
import { Chrome as Home, Search, ShoppingCart, User, LayoutGrid } from 'lucide-react-native';
import { StyleSheet, View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/core/constants/Colors';
import { useCart } from '@/core/store/cart';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { items } = useCart();
  const cartItemsCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.gray[400],
        tabBarStyle: {
          height: 60 + insets.bottom,
          paddingTop: 8,
          paddingBottom: insets.bottom,
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: Colors.gray[200],
          elevation: 8,
          shadowColor: 'rgba(0,0,0,0.1)',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter-Medium',
          fontSize: 12,
          marginBottom: 4,
        },
        headerShown: false,
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: 'CategorÃƒÂ­as',
          tabBarIcon: ({ color, size }) => <LayoutGrid size={size} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Buscar',
          tabBarIcon: ({ color, size }) => <Search size={size} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Carrito',
          tabBarIcon: ({ color, size }) => (
            <View>
              <ShoppingCart size={size} color={color} strokeWidth={2} />
              {cartItemsCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{cartItemsCount > 99 ? '99+' : cartItemsCount}</Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} strokeWidth={2} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    right: -6,
    top: -6,
    backgroundColor: Colors.accent,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
  },
});