import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import Colors from '@/core/constants/Colors';

type InputProps = {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: 'default' | 'number-pad' | 'decimal-pad' | 'numeric' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  secureTextEntry?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  error?: string;
  containerStyle?: ViewStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onBlur?: () => void;
  onFocus?: () => void;
};

export default function Input({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType = 'default',
  autoCapitalize = 'none',
  secureTextEntry = false,
  multiline = false,
  numberOfLines = 1,
  error,
  containerStyle,
  leftIcon,
  rightIcon,
  onBlur,
  onFocus,
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const toggleShowPassword = () => {
    setShowPassword(prev => !prev);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.focused,
          error && styles.error,
          multiline && styles.multiline,
        ]}
      >
        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
        <TextInput
          style={[
            styles.input,
            leftIcon && styles.inputWithLeftIcon,
            (rightIcon || secureTextEntry) && styles.inputWithRightIcon,
            multiline && styles.multilineInput,
          ]}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          secureTextEntry={secureTextEntry && !showPassword}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholderTextColor={Colors.gray[400]}
        />
        {secureTextEntry && (
          <TouchableOpacity
            style={styles.iconRight}
            onPress={toggleShowPassword}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            {showPassword ? (
              <EyeOff size={20} color={Colors.gray[500]} />
            ) : (
              <Eye size={20} color={Colors.gray[500]} />
            )}
          </TouchableOpacity>
        )}
        {rightIcon && !secureTextEntry && (
          <View style={styles.iconRight}>{rightIcon}</View>
        )}
      </View>
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.gray[700],
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.gray[300],
    borderRadius: 8,
    backgroundColor: 'white',
  },
  focused: {
    borderColor: Colors.primary,
    borderWidth: 1.5,
  },
  error: {
    borderColor: Colors.error,
  },
  multiline: {
    minHeight: 100,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.gray[800],
  },
  inputWithLeftIcon: {
    paddingLeft: 8,
  },
  inputWithRightIcon: {
    paddingRight: 8,
  },
  multilineInput: {
    textAlignVertical: 'top',
  },
  iconLeft: {
    paddingLeft: 16,
  },
  iconRight: {
    paddingRight: 16,
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
});