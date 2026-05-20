import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, Lock } from 'lucide-react-native';
import Colors from '@/core/constants/Colors';
import { useAuth } from '@/core/store/auth';
import ScreenHeader from '@/components/common/ScreenHeader';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';

export default function SignInScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validateForm = () => {
    let isValid = true;

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

    return isValid;
  };

  const handleSignIn = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const { error } = await signIn(email, password);
      
      if (error) {
        Alert.alert('Error', 'Correo electrÃƒÂ³nico o contraseÃƒÂ±a incorrectos');
        return;
      }
      
      router.replace('/profile');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      Alert.alert('Error', 'OcurriÃƒÂ³ un error al iniciar sesiÃƒÂ³n. Intenta de nuevo mÃƒÂ¡s tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Iniciar sesiÃƒÂ³n" showBackButton />
      
      <View style={styles.content}>
        <Text style={styles.subtitle}>Ingresa a tu cuenta para continuar</Text>
        
        <View style={styles.form}>
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
          
          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={() => router.push('/auth/forgot-password')}
          >
            <Text style={styles.forgotPasswordText}>Ã‚Â¿Olvidaste tu contraseÃƒÂ±a?</Text>
          </TouchableOpacity>
          
          <Button
            title="Iniciar sesiÃƒÂ³n"
            onPress={handleSignIn}
            loading={loading}
            fullWidth
            style={styles.button}
          />
          
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Ã‚Â¿No tienes una cuenta?</Text>
            <TouchableOpacity onPress={() => router.push('/auth/signup')}>
              <Text style={styles.signupLink}>Crear cuenta</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.primary,
  },
  button: {
    marginBottom: 16,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  signupText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.gray[600],
    marginRight: 8,
  },
  signupLink: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.primary,
  },
});