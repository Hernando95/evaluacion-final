import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Search as SearchIcon } from 'lucide-react-native';
import Colors from '@/core/constants/Colors';
import { supabase } from '@/core/api/supabase';
import { Product } from '@/types';
import ProductCard from '@/features/products/components/ProductCard';
import ScreenHeader from '@/components/common/ScreenHeader';
import Input from '@/components/common/Input';

export default function SearchScreen() {
  const params = useLocalSearchParams<{ query?: string }>();
  const [searchQuery, setSearchQuery] = useState(params.query || '');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (params.query) {
      setSearchQuery(params.query);
      handleSearch(params.query);
    }
  }, [params.query]);

  const handleSearch = async (query: string = searchQuery) => {
    if (!query.trim()) return;
    
    try {
      setLoading(true);
      setSearching(true);
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .ilike('name', `%${query}%`)
        .order('name');
        
      if (error) throw error;
      
      setProducts(data as Product[]);
    } catch (error) {
      console.error('Error searching products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Buscar Productos" />
      
      <View style={styles.searchContainer}>
        <Input
          placeholder="Ã‚Â¿QuÃƒÂ© estÃƒÂ¡s buscando?"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onBlur={() => handleSearch()}
          leftIcon={<SearchIcon size={20} color={Colors.gray[400]} />}
        />
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <>
          {searching && products.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No se encontraron productos.</Text>
              <Text style={styles.emptySubtext}>Intenta buscar con otras palabras.</Text>
            </View>
          ) : (
            <FlatList
              data={products}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.productCardContainer}>
                  <ProductCard product={item} />
                </View>
              )}
              numColumns={2}
              contentContainerStyle={styles.productsList}
              showsVerticalScrollIndicator={false}
            />
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productsList: {
    padding: 8,
  },
  productCardContainer: {
    width: '50%',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: Colors.gray[800],
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.gray[500],
    textAlign: 'center',
  },
});