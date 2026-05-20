import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Category } from '@/types';
import { supabase } from '@/core/api/supabase';
import Colors from '@/core/constants/Colors';
import ScreenHeader from '@/components/common/ScreenHeader';

export default function CategoriesScreen() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
        
      if (error) throw error;
      
      setCategories(data as Category[]);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchCategories();
  };

  const handleCategoryPress = (categoryId: string, categoryName: string) => {
    router.push({
      pathname: `/categories/${categoryId}`,
      params: { name: categoryName }
    });
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="CategorÃƒÂ­as" />
      
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.categoryItem}
            onPress={() => handleCategoryPress(item.id, item.name)}
            activeOpacity={0.8}
          >
            <Image
              source={{ uri: item.image || 'https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg' }}
              style={styles.categoryImage}
              resizeMode="cover"
            />
            <View style={styles.categoryContent}>
              <Text style={styles.categoryName}>{item.name}</Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
          />
        }
      />
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
  categoryItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    height: 100,
  },
  categoryImage: {
    width: 100,
    height: '100%',
  },
  categoryContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: Colors.gray[800],
  },
});