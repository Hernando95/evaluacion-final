import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { CircleCheck as CheckCircle, ShoppingBag } from 'lucide-react-native';
import Colors from '@/core/constants/Colors';
import Button from '@/components/common/Button';

export default function OrderSuccessScreen() {
  const router = useRouter();

  const handleContinueShopping = () => {
    router.replace('/home');
  };

  const handleViewOrders = () => {
    router.replace('/orders');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.successIconContainer}>
          <CheckCircle size={80} color={Colors.primary} />
        </View>
        
        <Text style={styles.title}>Ã‚Â¡Pedido realizado con ÃƒÂ©xito!</Text>
        <Text style={styles.message}>
          Tu pedido ha sido recibido y estÃƒÂ¡ siendo procesado. RecibirÃƒÂ¡s una notificaciÃƒÂ³n cuando estÃƒÂ© en camino.
        </Text>
        
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Puedes ver el estado de tu pedido en la sección &quot;Mis pedidos&quot; de tu perfil.
          </Text>
        </View>
        
        <View style={styles.buttonsContainer}>
          <Button
            title="Seguir comprando"
            onPress={handleContinueShopping}
            type="primary"
            fullWidth
            style={styles.button}
          />
          
          <Button
            title="Ver mis pedidos"
            onPress={handleViewOrders}
            type="outline"
            fullWidth
            style={styles.button}
            icon={<ShoppingBag size={20} color={Colors.primary} />}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  successIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: Colors.gray[800],
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.gray[600],
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  infoContainer: {
    backgroundColor: Colors.primary + '10',
    borderRadius: 8,
    padding: 16,
    width: '100%',
    marginBottom: 32,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.primary,
    textAlign: 'center',
  },
  buttonsContainer: {
    width: '100%',
  },
  button: {
    marginBottom: 16,
  },
});