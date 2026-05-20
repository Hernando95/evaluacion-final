import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { User, ShoppingBag, LogOut, CircleUser as UserCircle, Map, Phone, Mail, Settings } from 'lucide-react-native';
import Colors from '@/core/constants/Colors';
import { useAuth } from '@/core/store/auth';
import { supabase } from '@/core/api/supabase';
import { Order } from '@/types';
import ScreenHeader from '@/components/common/ScreenHeader';
import Button from '@/components/common/Button';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, signOut } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchOrders();
    }
  }, [isAuthenticated, user]);

  const fetchOrders = async () => {
    if (!user) return;
    
    try {
      setLoadingOrders(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (error) throw error;
      
      setOrders(data as Order[]);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Cerrar sesiÃƒÂ³n',
      'Ã‚Â¿EstÃƒÂ¡s seguro de que quieres cerrar sesiÃƒÂ³n?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar sesiÃƒÂ³n',
          onPress: () => signOut(),
        },
      ]
    );
  };

  const handleViewOrder = (orderId: string) => {
    router.push(`/order/${orderId}`);
  };

  const handleEditProfile = () => {
    router.push('/profile/edit');
  };

  const renderProfileSection = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      );
    }

    if (!isAuthenticated) {
      return (
        <View style={styles.authContainer}>
          <UserCircle size={80} color={Colors.gray[400]} />
          <Text style={styles.authTitle}>Iniciar sesiÃƒÂ³n</Text>
          <Text style={styles.authText}>
            Inicia sesiÃƒÂ³n para gestionar tus pedidos y guardar tus datos de envÃƒÂ­o.
          </Text>
          <Button
            title="Iniciar sesiÃƒÂ³n"
            onPress={() => router.push('/auth/signin')}
            style={styles.authButton}
            type="primary"
          />
          <Button
            title="Crear cuenta"
            onPress={() => router.push('/auth/signup')}
            style={styles.authButton}
            type="outline"
          />
        </View>
      );
    }

    return (
      <View>
        <View style={styles.profileHeader}>
          <View style={styles.profileInfo}>
            <UserCircle size={60} color={Colors.primary} />
            <View style={styles.profileTextContainer}>
              <Text style={styles.profileName}>{user?.name || 'Usuario'}</Text>
              <Text style={styles.profileEmail}>{user?.email}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleEditProfile}>
            <Text style={styles.editProfileText}>Editar</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.contactInfo}>
          {user?.phone && (
            <View style={styles.contactItem}>
              <Phone size={20} color={Colors.gray[500]} />
              <Text style={styles.contactText}>{user.phone}</Text>
            </View>
          )}
          
          {user?.address && (
            <View style={styles.contactItem}>
              <Map size={20} color={Colors.gray[500]} />
              <Text style={styles.contactText}>{user.address}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>ÃƒÅ¡ltimos pedidos</Text>
            <TouchableOpacity onPress={() => router.push('/orders')}>
              <Text style={styles.sectionLink}>Ver todos</Text>
            </TouchableOpacity>
          </View>
          
          {orders.length > 0 ? (
            orders.map(order => (
              <TouchableOpacity
                key={order.id}
                style={styles.orderItem}
                onPress={() => handleViewOrder(order.id)}
              >
                <ShoppingBag size={20} color={Colors.primary} />
                <View style={styles.orderInfo}>
                  <Text style={styles.orderNumber}>Pedido #{order.id.substring(0, 8)}</Text>
                  <Text style={styles.orderDate}>
                    {new Date(order.created_at).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.orderStatus}>
                  <View style={[styles.statusBadge, styles[`status${order.status.charAt(0).toUpperCase() + order.status.slice(1)}`]]}>
                    <Text style={styles.statusText}>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</Text>
                  </View>
                  <Text style={styles.orderTotal}>${order.total.toFixed(2)}</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyOrdersContainer}>
              <Text style={styles.emptyOrdersText}>No hay pedidos recientes.</Text>
            </View>
          )}
        </View>
        
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={styles.optionItem}
            onPress={() => router.push('/orders')}
          >
            <ShoppingBag size={24} color={Colors.gray[700]} />
            <Text style={styles.optionText}>Mis pedidos</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.optionItem}
            onPress={() => router.push('/profile/edit')}
          >
            <User size={24} color={Colors.gray[700]} />
            <Text style={styles.optionText}>Datos personales</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.optionItem}
            onPress={() => router.push('/settings')}
          >
            <Settings size={24} color={Colors.gray[700]} />
            <Text style={styles.optionText}>ConfiguraciÃƒÂ³n</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.optionItem}
            onPress={handleSignOut}
          >
            <LogOut size={24} color={Colors.error} />
            <Text style={[styles.optionText, { color: Colors.error }]}>Cerrar sesiÃƒÂ³n</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Mi perfil" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {renderProfileSection()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: Colors.gray[600],
  },
  authContainer: {
    padding: 24,
    alignItems: 'center',
  },
  authTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: Colors.gray[800],
    marginTop: 16,
    marginBottom: 8,
  },
  authText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.gray[600],
    textAlign: 'center',
    marginBottom: 24,
  },
  authButton: {
    width: '100%',
    marginBottom: 12,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileTextContainer: {
    marginLeft: 16,
  },
  profileName: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: Colors.gray[800],
  },
  profileEmail: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.gray[600],
  },
  editProfileText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.primary,
  },
  contactInfo: {
    padding: 16,
    backgroundColor: Colors.gray[50],
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.gray[700],
    marginLeft: 8,
    flex: 1,
  },
  section: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.gray[800],
  },
  sectionLink: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.primary,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  orderInfo: {
    flex: 1,
    marginLeft: 12,
  },
  orderNumber: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.gray[800],
  },
  orderDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Colors.gray[500],
  },
  orderStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  statusPending: {
    backgroundColor: Colors.warning + '20',
  },
  statusProcessing: {
    backgroundColor: Colors.accent + '20',
  },
  statusCompleted: {
    backgroundColor: Colors.success + '20',
  },
  statusCancelled: {
    backgroundColor: Colors.error + '20',
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  orderTotal: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: Colors.gray[800],
  },
  emptyOrdersContainer: {
    padding: 16,
    alignItems: 'center',
  },
  emptyOrdersText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.gray[500],
  },
  optionsContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  optionText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: Colors.gray[800],
    marginLeft: 12,
  },
});