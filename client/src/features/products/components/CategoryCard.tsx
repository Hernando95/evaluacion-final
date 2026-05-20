import React from 'react';
import { StyleSheet, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '@/core/constants/Colors';
import { Category } from '@/types';

type CategoryCardProps = {
  category: Category;
};

export default function CategoryCard({ category }: CategoryCardProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/categories/${category.id}`);
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: category.image || 'https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg' }}
        style={styles.image}
        resizeMode="cover"
      />
      <Text style={styles.name}>{category.name}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 120,
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12,
    marginBottom: 12,
    backgroundColor: Colors.gray[900],
  },
  image: {
    width: '100%',
    height: '100%',
    opacity: 0.7,
  },
  name: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
    color: 'white',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
  },
});