import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { CreditCard, Truck, Map, CircleCheck as CheckCircle } from 'lucide-react-native';
import Colors from '@/core/constants/Colors';
import { useCart } from '@/core/store/cart';
import { useAuth } from '@/core/store/auth';
import { supabase } from '@/core/api/supabase';
import ScreenHeader from '@/components/common/ScreenHeader';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';

type DeliveryOption = 'delivery' | 'pickup';
type PaymentMethod = 'card' | 'cash';

export default function CheckoutScreen() {
  const router = useRouter();
  const { items, total, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [deliveryOption, setDeliveryOption] = useState<DeliveryOption>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [address, setAddress] = useState(user?.address || '');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      Alert.alert(
        'Inicio de sesiÃƒÂ³n requerido',
        'Debes iniciar sesiÃƒÂ³n para realizar una compra',
        [
          {
            text: 'Iniciar sesiÃƒÂ³n',
            onPress: () => router.push('/auth/signin')
          }
        ]
      );
      return;
    }

    if (items.length === 0) {
      Alert.alert(
        'Carrito vacÃƒÂ­o',
        'Tu carrito estÃƒÂ¡ vacÃƒÂ­o',
        [
          {
            text: 'Ir a comprar',
            onPress: () => router.push('/home')
          }
        ]
      );
    }
  }, [isAuthenticated, items]);

  const handlePlaceOrder = async () => {
    if (!isAuthenticated || !user) {
      Alert.alert('Error', 'Debes iniciar sesiÃƒÂ³n para realizar una compra');
      return;
    }

    if (items.length === 0) {
      Alert.alert('Error', 'Tu carrito estÃƒÂ¡ vacÃƒÂ­o');
      return;
    }

    if (deliveryOption === 'delivery' && !address.trim()) {
      Alert.alert('Error', 'Debes proporcionar una direcciÃƒÂ³n de entrega');
      return;
    }

    try {
      setLoading(true);

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            user_id: user.id,
            total: total(),
            status: 'pending',
            address: deliveryOption === 'delivery' ? address : 'Retiro en tienda',
            payment_method: paymentMethod === 'card' ? 'Tarjeta de crÃƒÂ©dito' : 'Efectivo',
            notes: notes.trim(),
          }
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.discounted_price || item.product.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Update user's address if it has changed
      if (user.address !== address && address.trim()) {
        await supabase
          .from('users')
          .update({ address })
          .eq('id', user.id);
      }

      // Update product stock
      for (const item of items) {
        await supabase
          .from('products')
          .update({ stock: item.product.stock - item.quantity })
          .eq('id', item.product.id);
      }

      // Clear cart and redirect to success page
      clearCart();
      router.replace('/order-success');
    } catch (error) {
      console.error('Error placing order:', error);
      Alert.alert('Error', 'OcurriÃƒÂ³ un error al procesar tu pedido. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Finalizar compra" showBackButton />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen del pedido</Text>
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Productos ({items.length}):</Text>
              <Text style={styles.summaryValue}>${total().toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>EnvÃƒÂ­o:</Text>
              <Text style={styles.summaryValue}>Gratis</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>${total().toFixed(2)}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MÃƒÂ©todo de envÃƒÂ­o</Text>
          <View style={styles.optionContainer}>
            <TouchableOpacity
              style={[
                styles.option,
                deliveryOption === 'delivery' && styles.selectedOption,
              ]}
              onPress={() => setDeliveryOption('delivery')}
            >
              <View style={styles.optionIconContainer}>
                <Truck size={24} color={deliveryOption === 'delivery' ? Colors.primary : Colors.gray[500]} />
              </View>
              <View style={styles.optionContent}>
                <Text style={[
                  styles.optionTitle,
                  deliveryOption === 'delivery' && styles.selectedOptionText,
                ]}>
                  Entrega a domicilio
                </Text>
                <Text style={styles.optionDescription}>
                  Entrega en 24-48 horas
                </Text>
              </View>
              {deliveryOption === 'delivery' && (
                <CheckCircle size={24} color={Colors.primary} />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.option,
                deliveryOption === 'pickup' && styles.selectedOption,
              ]}
              onPress={() => setDeliveryOption('pickup')}
            >
              <View style={styles.optionIconContainer}>
                <Map size={24} color={deliveryOption === 'pickup' ? Colors.primary : Colors.gray[500]} />
              </View>
              <View style={styles.optionContent}>
                <Text style={[
                  styles.optionTitle,
                  deliveryOption === 'pickup' && styles.selectedOptionText,
                ]}>
                  Retirar en tienda
                </Text>
                <Text style={styles.optionDescription}>
                  Disponible en 2 horas
                </Text>
              </View>
              {deliveryOption === 'pickup' && (
                <CheckCircle size={24} color={Colors.primary} />
              )}
            </TouchableOpacity>
          </View>
          
          {deliveryOption === 'delivery' && (
            <Input
              label="DirecciÃƒÂ³n de entrega"
              placeholder="Ingresa tu direcciÃƒÂ³n completa"
              value={address}
              onChangeText={setAddress}
              multiline
              numberOfLines={3}
            />
          )}
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MÃƒÂ©todo de pago</Text>
          <View style={styles.optionContainer}>
            <TouchableOpacity
              style={[
                styles.option,
                paymentMethod === 'card' && styles.selectedOption,
              ]}
              onPress={() => setPaymentMethod('card')}
            >
              <View style={styles.optionIconContainer}>
                <CreditCard size={24} color={paymentMethod === 'card' ? Colors.primary : Colors.gray[500]} />
              </View>
              <View style={styles.optionContent}>
                <Text style={[
                  styles.optionTitle,
                  paymentMethod === 'card' && styles.selectedOptionText,
                ]}>
                  Tarjeta de crÃƒÂ©dito
                </Text>
                <Text style={styles.optionDescription}>
                  Pago seguro en lÃƒÂ­nea
                </Text>
              </View>
              {paymentMethod === 'card' && (
                <CheckCircle size={24} color={Colors.primary} />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.option,
                paymentMethod === 'cash' && styles.selectedOption,
              ]}
              onPress={() => setPaymentMethod('cash')}
            >
              <View style={styles.optionIconContainer}>
                <Text style={[
                  styles.currencySymbol,
                  paymentMethod === 'cash' && { color: Colors.primary }
                ]}>
                  $
                </Text>
              </View>
              <View style={styles.optionContent}>
                <Text style={[
                  styles.optionTitle,
                  paymentMethod === 'cash' && styles.selectedOptionText,
                ]}>
                  Efectivo
                </Text>
                <Text style={styles.optionDescription}>
                  Pago al recibir el pedido
                </Text>
              </View>
              {paymentMethod === 'cash' && (
                <CheckCircle size={24} color={Colors.primary} />
              )}
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notas adicionales</Text>
          <Input
            placeholder="Instrucciones especiales para la entrega..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
          />
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <Button
          title="Confirmar pedido"
          onPress={handlePlaceOrder}
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
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: Colors.gray[800],
    marginBottom: 16,
  },
  summaryContainer: {
    backgroundColor: Colors.gray[50],
    borderRadius: 8,
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.gray[700],
  },
  summaryValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.gray[800],
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.gray[300],
    paddingTop: 12,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: Colors.gray[800],
  },
  totalValue: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: Colors.primary,
  },
  optionContainer: {
    marginBottom: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.gray[300],
    borderRadius: 8,
    marginBottom: 12,
  },
  selectedOption: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  optionIconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: Colors.gray[100],
  },
  optionContent: {
    flex: 1,
    marginLeft: 12,
  },
  optionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.gray[800],
    marginBottom: 4,
  },
  selectedOptionText: {
    color: Colors.primary,
  },
  optionDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.gray[600],
  },
  currencySymbol: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: Colors.gray[500],
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
    backgroundColor: 'white',
  },
});