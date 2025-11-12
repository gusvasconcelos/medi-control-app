import { ControlledInput } from '@/src/components';
import { Colors } from '@/src/constants/colors';
import { useAuth } from '@/src/hooks/useAuth';
import { useToast } from '@/src/hooks/useToast';
import { LoginFormData, loginSchema, RegisterFormData, registerSchema } from '@/src/schemas';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { zodResolver } from '@hookform/resolvers/zod';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';

type AuthMode = 'login' | 'register';

export default function AuthScreen() {
  const { register: registerUser, signIn, isLoading, error, clearError } = useAuth();
  const toast = useToast();
  const [mode, setMode] = useState<AuthMode>('login');

  const {
    control: loginControl,
    handleSubmit: handleLoginSubmit,
    reset: resetLoginForm,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const {
    control: registerControl,
    handleSubmit: handleRegisterSubmit,
    reset: resetRegisterForm,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      passwordConfirmation: '',
    },
  });

  const onLoginSubmit = async (data: LoginFormData) => {
    try {
      clearError();
      await signIn({ email: data.email, password: data.password });
      toast.success('Login realizado com sucesso!');
      router.replace('/(tabs)');
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  const onRegisterSubmit = async (data: RegisterFormData) => {
    try {
      clearError();
      await registerUser(data);

      toast.success('Conta criada! Faça login para continuar.');

      resetRegisterForm();
      setMode('login');
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    clearError();
  };

  useEffect(() => {
    if (error) {
        toast.error(error.message);
    }
  }, [error]);

  const validationErrors = error?.code === 'VALIDATION' ? error.details : undefined;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView
        className="flex-1 bg-background dark:bg-dark-background"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center px-6 py-10 max-w-[600px] w-full self-center">
        {/* Logo */}
        <View className="items-center mb-4">
          <LinearGradient
            colors={Colors.gradients.medicalLogo}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: 80,
              height: 80,
              borderRadius: 24,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <MaterialIcons name="medication" size={40} color="white" />
          </LinearGradient>
        </View>

        {/* Title */}
        <Text className="text-3xl font-bold text-foreground dark:text-dark-foreground text-center mb-2">
          MediControl
        </Text>
        <Text className="text-sm text-muted-foreground dark:text-dark-muted-foreground text-center mb-8 leading-5">
          {mode === 'login'
            ? 'Acesse sua conta para gerenciar seus medicamentos'
            : 'Crie sua conta para começar a gerenciar seus medicamentos'}
        </Text>

        {/* Tabs */}
        <View className="flex-row bg-muted dark:bg-dark-muted rounded-2xl p-1 mb-6">
          <TouchableOpacity
            className={`flex-1 py-3 rounded-xl items-center ${
              mode === 'login' ? 'bg-primary' : 'bg-transparent'
            }`}
            onPress={() => switchMode('login')}
          >
            <View className="flex-row items-center">
              <MaterialIcons
                name="lock"
                size={16}
                color={mode === 'login' ? Colors.primary.foreground : Colors.muted.foreground}
                style={{ marginRight: 6 }}
              />
              <Text
                className={`text-sm font-semibold ${
                  mode === 'login' ? 'text-primary-foreground' : 'text-muted-foreground'
                }`}
              >
                Login
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            className={`flex-1 py-3 rounded-xl items-center ${
              mode === 'register' ? 'bg-primary' : 'bg-transparent'
            }`}
            onPress={() => switchMode('register')}
          >
            <View className="flex-row items-center">
              <MaterialIcons
                name="person-add"
                size={16}
                color={mode === 'register' ? Colors.primary.foreground : Colors.muted.foreground}
                style={{ marginRight: 6 }}
              />
              <Text
                className={`text-sm font-semibold ${
                  mode === 'register' ? 'text-primary-foreground' : 'text-muted-foreground'
                }`}
              >
                Registro
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Login Form */}
        {mode === 'login' ? (
          <View key="login-form" className="gap-2">
            <ControlledInput
              control={loginControl}
              name="email"
              label="E-mail"
              placeholder="seu@email.com"
              errors={validationErrors}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!isLoading}
            />

            <ControlledInput
              control={loginControl}
              name="password"
              label="Senha"
              placeholder="Digite sua senha"
              errors={validationErrors}
              secureTextEntry
              editable={!isLoading}
            />

            {/* Remember Me - Keep as controlled component but simpler */}
            {/* For now we'll keep this disabled as it requires different handling */}
            {/* TODO: Implement remember me with react-hook-form */}

            {/* Login Button */}
            <TouchableOpacity
              className="py-4 rounded-xl mt-4"
              style={{
                backgroundColor: isLoading ? Colors.primary.light : Colors.primary.DEFAULT,
              }}
              onPress={handleLoginSubmit(onLoginSubmit)}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={Colors.primary.foreground} />
              ) : (
                <Text className="text-base font-semibold text-center" style={{ color: Colors.primary.foreground }}>
                  Entrar
                </Text>
              )}
            </TouchableOpacity>

            {/* Forgot Password */}
            <TouchableOpacity
              className="items-center mt-4"
              onPress={() => router.push('/(auth)/forgot-password')}
            >
              <Text className="text-sm font-medium" style={{ color: Colors.primary.DEFAULT }}>
                Esqueci minha senha
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Register Form */
          <View key="register-form" className="gap-2">
            <ControlledInput
              control={registerControl}
              name="name"
              label="Nome"
              placeholder="Digite seu nome"
              errors={validationErrors}
              editable={!isLoading}
            />

            <ControlledInput
              control={registerControl}
              name="email"
              label="E-mail"
              placeholder="seu@email.com"
              errors={validationErrors}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!isLoading}
            />

            <ControlledInput
              control={registerControl}
              name="password"
              label="Senha"
              placeholder="Digite sua senha"
              errors={validationErrors}
              secureTextEntry
              editable={!isLoading}
            />

            <ControlledInput
              control={registerControl}
              name="passwordConfirmation"
              label="Confirmação de Senha"
              placeholder="Digite sua senha novamente"
              errors={validationErrors}
              secureTextEntry
              editable={!isLoading}
            />

            {/* Register Button */}
            <TouchableOpacity
              className="py-4 rounded-xl mt-4"
              style={{
                backgroundColor: isLoading ? Colors.primary.light : Colors.primary.DEFAULT,
              }}
              onPress={handleRegisterSubmit(onRegisterSubmit)}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={Colors.primary.foreground} />
              ) : (
                <Text className="text-base font-semibold text-center" style={{ color: Colors.primary.foreground }}>
                  Criar conta
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
