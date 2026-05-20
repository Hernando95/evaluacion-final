import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/core/constants/Colors';

type ScreenHeaderProps = {
  title: string;
  showBackButton?: boolean;
  rightComponent?: React.ReactNode;
};

export default function ScreenHeader({
  title,
  showBackButton = false,
  rightComponent,
}: ScreenHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
      <View style={styles.leftContainer}>
        {showBackButton && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <ChevronLeft size={24} color={Colors.gray[800]} />
          </TouchableOpacity>
        )}
        <Text style={styles.title}>{title}</Text>
      </View>
      {rightComponent && (
        <View style={styles.rightContainer}>
          {rightComponent}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 8,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: Colors.gray[800],
  },
  rightContainer: {},
});