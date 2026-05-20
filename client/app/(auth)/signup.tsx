import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, Lock, User } from 'lucide-react-native';
import Colors from '@/core/constants/Colors';
import { useAuth } from '@/core/store/auth';
import ScreenHeader from '@/components/common/ScreenHeader';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const validateForm = () => {
    let isValid = true;

    // Validate name
    if (!name.trim()) {
      setNameError('El nombre es obligatorio');
      isValid = false;
    } else {
      setNameError('');
    }

    // Validate email
    if (!email.trim()) {
      setEmailError('El correo electrÃƒÂ³nico es obligatorio');
      isValid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      setEmailError('Correo electrÃƒÂ³nico invÃƒÂ¡lido');
      isValid = false;
    } else {
      setEmailError('');
    }

    // Validate password
    if (!password) {
      setPasswordError('La contraseÃƒÂ±a es obligatoria');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('La contraseÃƒÂ±a debe tener al menos 6 caracteres');
      isValid = false;
    } else {
      setPasswordError('');
    }

    // Validate confirm password
    if (!confirmPassword) {
      setConfirmPasswordError('Debes confirmar tu contraseÃƒÂ±a');
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Las contraseÃƒÂ±as no coinciden');
      isValid = false;
    } else {
      setConfirmPasswordError('');
    }

    return isValid;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const { error } = await signUp(email, password, name);
      
      if (error) {
        Alert.alert('Error', error.message || 'OcurriÃƒÂ³ un error al crear la cuenta');
        return;
      }
      
      Alert.alert(
        'Cuenta creada',
        'Tu cuenta ha sido creada exitosamente. Inicia sesiÃƒÂ³n para continuar.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/auth/signin'),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'OcurriÃƒÂ³ un error al crear la cuenta. Intenta de nuevo mÃƒÂ¡s tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Crear cuenta" showBackButton />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>Crea una cuenta para comenzar a comprar</Text>
        
        <View style={styles.form}>
          <Input
            label="Nombre"
            placeholder="Tu nombre"
            value={name}
            onChangeText={setName}
            leftIcon={<User size={20} color={Colors.gray[400]} />}
            error={nameError}
          />
          
          <Input
            label="Correo electrÃƒÂ³nico"
            placeholder="correo@ejemplo.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<Mail size={20} color={Colors.gray[400]} />}
            error={emailError}
          />
          
          <Input
            label="ContraseÃƒÂ±a"
            placeholder="********"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            leftIcon={<Lock size={20} color={Colors.gray[400]} />}
            error={passwordError}
          />
          
          <Input
            label="Confirmar contraseÃƒÂ±a"
            placeholder="********"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            leftIcon={<Lock size={20} color={Colors.gray[400]} />}
            error={confirmPasswordError}
          />
          
          <Button
            title="Crear cuenta"
            onPress={handleSignUp}
            loading={loading}
            fullWidth
            style={styles.button}
          />
          
          <View style={styles.signinContainer}>
            <Text style={styles.signinText}>Ã‚Â¿Ya tienes una cuenta?</Text>
            <TouchableOpacity onPress={() => router.push('/auth/signin')}>
              <Text style={styles.signinLink}>Iniciar sesiÃƒÂ³n</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    padding: 24,
    flex: 1,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.gray[600],
    marginBottom: 24,
  },
  form: {
    marginBottom: 24,
  },
  button: {
    marginTop: 16,
  },
  signinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 24,
  },
  signinText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.gray[600],
    marginRight: 8,
  },
  signinLink: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.primary,
  },
});