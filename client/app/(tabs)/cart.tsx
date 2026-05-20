import React, { useState } from 'react';
import { View, StyleSheet, Text, FlatList, Image, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react-native';
import Colors from '@/core/constants/Colors';
import { useCart } from '@/core/store/cart';
import { useAuth } from '@/core/store/auth';
import ScreenHeader from '@/components/common/ScreenHeader';
import Button from '@/components/common/Button';

export default function CartScreen() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, total, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleCheckout = () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Iniciar sesiÃƒÂ³n',
        'Necesitas iniciar sesiÃƒÂ³n para continuar con la compra.',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },
          {
            text: 'Iniciar sesiÃƒÂ³n',
            onPress: () => router.push('/auth/signin'),
          },
        ]
      );
      return;
    }
    
    router.push('/checkout');
  };

  const handleClearCart = () => {
    Alert.alert(
      'Vaciar carrito',
      'Ã‚Â¿EstÃƒÂ¡s seguro de que quieres vaciar tu carrito?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Vaciar',
          onPress: () => clearCart(),
          style: 'destructive',
        },
      ]
    );
  };

  const incrementQuantity = (id: string) => {
    const item = items.find(item => item.product.id === id);
    if (item) {
      updateQuantity(id, item.quantity + 1);
    }
  };

  const decrementQuantity = (id: string, currentQty: number) => {
    if (currentQty <= 1) {
      Alert.alert(
        'Eliminar producto',
        'Ã‚Â¿Quieres eliminar este producto del carrito?',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },
          {
            text: 'Eliminar',
            onPress: () => removeItem(id),
            style: 'destructive',
          },
        ]
      );
      return;
    }
    
    updateQuantity(id, currentQty - 1);
  };

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Carrito de compras" />
        <View style={styles.emptyContainer}>
          <ShoppingBag size={80} color={Colors.gray[300]} />
          <Text style={styles.emptyTitle}>Tu carrito estÃƒÂ¡ vacÃƒÂ­o</Text>
          <Text style={styles.emptyText}>Agrega productos al carrito para comenzar a comprar.</Text>
          <Button
            title="Explorar productos"
            onPress={() => router.push('/home')}
            style={styles.emptyButton}
            type="primary"
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader 
        title="Carrito de compras" 
        rightComponent={
          <TouchableOpacity onPress={handleClearCart}>
            <Text style={styles.clearText}>Vaciar</Text>
          </TouchableOpacity>
        }
      />
      
      <FlatList
        data={items}
        keyExtractor={item => item.product.id}
        renderItem={({ item }) => (
          <View style={styles.cartItem}>
            <Image
              source={{ uri: item.product.image }}
              style={styles.productImage}
              resizeMode="cover"
            />
            <View style={styles.productInfo}>
              <Text style={styles.productName} numberOfLines={2}>
                {item.product.name}
              </Text>
              <Text style={styles.productPrice}>
                ${(item.product.discounted_price || item.product.price).toFixed(2)}
              </Text>
              
              <View style={styles.actionsContainer}>
                <View style={styles.quantityContainer}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => decrementQuantity(item.product.id, item.quantity)}
                  >
                    <Minus size={16} color={Colors.primary} />
                  </TouchableOpacity>
                  <Text style={styles.quantityText}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => incrementQuantity(item.product.id)}
                  >
                    <Plus size={16} color={Colors.primary} />
                  </TouchableOpacity>
                </View>
                
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => removeItem(item.product.id)}
                >
                  <Trash2 size={16} color={Colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
      
      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalAmount}>${total().toFixed(2)}</Text>
        </View>
        <Button
          title="Proceder al pago"
          onPress={handleCheckout}
          fullWidth
          size="large"
          loading={loading}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  listContent: {
    padding: 16,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    padding: 12,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.gray[800],
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: Colors.primary,
    marginBottom: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.gray[200],
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  quantityButton: {
    padding: 6,
  },
  quantityText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.gray[800],
    paddingHorizontal: 8,
    minWidth: 20,
    textAlign: 'center',
  },
  deleteButton: {
    padding: 6,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
    backgroundColor: 'white',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: Colors.gray[700],
  },
  totalAmount: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: Colors.gray[900],
  },
  clearText: {
    fontSize: 14,
    color: Colors.error,
    fontFamily: 'Inter-Medium',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: Colors.gray[800],
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.gray[600],
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    width: '80%',
  },
});