import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { ShoppingCart, Plus, Minus } from 'lucide-react-native';
import Colors from '@/core/constants/Colors';
import { Product } from '@/types';
import { useCart } from '@/core/store/cart';

type ProductCardProps = {
  product: Product;
  horizontal?: boolean;
};

const { width } = Dimensions.get('window');
const cardWidth = horizontal => horizontal ? width * 0.8 : width * 0.45;

export default function ProductCard({ product, horizontal = false }: ProductCardProps) {
  const router = useRouter();
  const { items, addItem, updateQuantity } = useCart();
  
  const cartItem = items.find(item => item.product.id === product.id);
  const quantity = cartItem?.quantity || 0;
  
  const hasDiscount = product.discounted_price !== null && product.discounted_price !== undefined;
  const discountPercentage = hasDiscount 
    ? Math.round(((product.price - (product.discounted_price || 0)) / product.price) * 100) 
    : 0;
  
  const handlePress = () => {
    router.push(`/product/${product.id}`);
  };
  
  const handleAddToCart = () => {
    addItem(product, 1);
  };
  
  const incrementQuantity = () => {
    updateQuantity(product.id, quantity + 1);
  };
  
  const decrementQuantity = () => {
    updateQuantity(product.id, quantity - 1);
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        horizontal ? styles.horizontalCard : styles.verticalCard,
        { width: cardWidth(horizontal) }
      ]}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      {hasDiscount && (
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>{discountPercentage}% OFF</Text>
        </View>
      )}
      
      <Image
        source={{ uri: product.image }}
        style={styles.image}
        resizeMode="cover"
      />
      
      <View style={styles.contentContainer}>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        <View style={styles.priceContainer}>
          {hasDiscount ? (
            <View style={styles.priceRow}>
              <Text style={styles.discountedPrice}>
                ${product.discounted_price?.toFixed(2)}
              </Text>
              <Text style={styles.originalPrice}>
                ${product.price.toFixed(2)}
              </Text>
            </View>
          ) : (
            <Text style={styles.price}>${product.price.toFixed(2)}</Text>
          )}
          <Text style={styles.unit}>/ {product.unit}</Text>
        </View>
        
        {quantity === 0 ? (
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddToCart}
            activeOpacity={0.8}
          >
            <ShoppingCart size={18} color="white" />
            <Text style={styles.addButtonText}>Agregar</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={decrementQuantity}
            >
              <Minus size={18} color={Colors.primary} />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={incrementQuantity}
            >
              <Plus size={18} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  verticalCard: {
    height: 280,
    marginHorizontal: 8,
  },
  horizontalCard: {
    height: 140,
    flexDirection: 'row',
    marginRight: 16,
  },
  discountBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: Colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    zIndex: 1,
  },
  discountText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Inter-Bold',
  },
  image: {
    width: '100%',
    height: 140,
  },
  contentContainer: {
    padding: 12,
    flex: 1,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.gray[800],
    marginBottom: 8,
  },
  priceContainer: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: Colors.gray[900],
  },
  discountedPrice: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: Colors.primary,
  },
  originalPrice: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.gray[500],
    textDecorationLine: 'line-through',
    marginLeft: 6,
  },
  unit: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.gray[500],
    marginLeft: 4,
  },
  addButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: 'white',
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginLeft: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.gray[200],
    borderRadius: 8,
    paddingHorizontal: 8,
    height: 40,
  },
  quantityButton: {
    padding: 6,
  },
  quantityText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.gray[800],
  },
});