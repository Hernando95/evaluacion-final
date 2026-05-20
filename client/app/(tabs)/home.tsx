import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search } from 'lucide-react-native';
import Colors from '@/core/constants/Colors';
import { supabase } from '@/core/api/supabase';
import { Product, Category } from '@/types';
import ProductCard from '@/features/products/components/ProductCard';
import CategoryCard from '@/features/products/components/CategoryCard';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [discountedProducts, setDiscountedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Get featured products
      const { data: featured, error: featuredError } = await supabase
        .from('products')
        .select('*')
        .eq('featured', true)
        .limit(5);
        
      if (featuredError) throw featuredError;
      
      // Get products with discounts
      const { data: discounted, error: discountedError } = await supabase
        .from('products')
        .select('*')
        .not('discounted_price', 'is', null)
        .limit(5);
        
      if (discountedError) throw discountedError;
      
      // Get categories
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('*');
        
      if (categoryError) throw categoryError;
      
      setFeaturedProducts(featured as Product[]);
      setDiscountedProducts(discounted as Product[]);
      setCategories(categoryData as Category[]);
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleSearch = () => {
    if (searchText.trim()) {
      router.push({
        pathname: '/search',
        params: { query: searchText }
      });
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Mercado Express</Text>
          <Text style={styles.subtitle}>Tu supermercado en lÃƒÂ­nea</Text>
        </View>
        
        <View style={styles.searchContainer}>
          <Input
            placeholder="Ã‚Â¿QuÃƒÂ© estÃƒÂ¡s buscando?"
            value={searchText}
            onChangeText={setSearchText}
            containerStyle={styles.searchInputContainer}
            rightIcon={
              <Button
                title="Buscar"
                onPress={handleSearch}
                type="primary"
                size="small"
              />
            }
          />
        </View>
        
        <View style={styles.categoriesContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>CategorÃƒÂ­as</Text>
            <Button
              title="Ver todas"
              onPress={() => router.push('/categories')}
              type="outline"
              size="small"
            />
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          >
            {categories.map(category => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </ScrollView>
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Productos destacados</Text>
            <Button
              title="Ver mÃƒÂ¡s"
              onPress={() => router.push('/categories/featured')}
              type="outline"
              size="small"
            />
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productsList}
          >
            {featuredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                horizontal
              />
            ))}
          </ScrollView>
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Ofertas especiales</Text>
            <Button
              title="Ver mÃƒÂ¡s"
              onPress={() => router.push('/categories/discounted')}
              type="outline"
              size="small"
            />
          </View>
          <View style={styles.productsGrid}>
            {discountedProducts.map(product => (
              <View key={product.id} style={styles.productCardContainer}>
                <ProductCard product={product} />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[50],
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.gray[600],
  },
  header: {
    padding: 16,
    backgroundColor: Colors.primary,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: 'white',
    opacity: 0.9,
    marginTop: 4,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    marginBottom: 16,
  },
  searchInputContainer: {
    marginBottom: 0,
  },
  categoriesContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: Colors.gray[800],
  },
  categoriesList: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  section: {
    marginBottom: 24,
  },
  productsList: {
    paddingLeft: 16,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
    justifyContent: 'space-between',
  },
  productCardContainer: {
    width: '50%',
  },
});