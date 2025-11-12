import { ControlledInput } from '@/src/components';
import { Colors } from '@/src/constants/colors';
import { useToast } from '@/src/hooks/useToast';
import { ResetPasswordFormData, resetPasswordSchema } from '@/src/schemas';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { zodResolver } from '@hookform/resolvers/zod';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { resetPassword } from '@/src/api/services/auth';
import type { ApiError } from '@/src/@types';

export default function ResetPasswordScreen() {
  const toast = useToast();
  const { token } = useLocalSearchParams<{ token: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      password: '',
      passwordConfirmation: '',
    },
  });

  useEffect(() => {
    if (!token) {
      toast.error('Token de redefinição inválido ou ausente.');
      setTimeout(() => {
        router.replace('/(auth)/auth');
      }, 2000);
    }
  }, [token]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      toast.error('Token de redefinição inválido ou ausente.');
      return;
    }

    try {
      setIsLoading(true);
      setValidationErrors(undefined);

      await resetPassword({
        token,
        password: data.password,
        passwordConfirmation: data.passwordConfirmation,
      });

      toast.success('Senha redefinida com sucesso! Faça login para continuar.');

      // Wait a bit before navigating to show the success message
      setTimeout(() => {
        router.replace('/(auth)/auth');
      }, 2000);
    } catch (err) {
      const error = err as ApiError;

      if (error.code === 'VALIDATION' && error.details) {
        setValidationErrors(error.details);
      }

      toast.error(error.message || 'Erro ao redefinir senha. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <View className="flex-1 bg-background dark:bg-dark-background justify-center items-center px-6">
        <ActivityIndicator size="large" color={Colors.primary.DEFAULT} />
        <Text className="text-base text-muted-foreground dark:text-dark-muted-foreground mt-4 text-center">
          Verificando token...
        </Text>
      </View>
    );
  }

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
            <MaterialIcons name="lock-reset" size={40} color="white" />
          </LinearGradient>
        </View>

        {/* Title */}
        <Text className="text-3xl font-bold text-foreground dark:text-dark-foreground text-center mb-2">
          Redefinir Senha
        </Text>
        <Text className="text-sm text-muted-foreground dark:text-dark-muted-foreground text-center mb-8 leading-5">
          Digite sua nova senha para redefinir o acesso à sua conta
        </Text>

        {/* Form */}
        <View className="gap-2">
          <ControlledInput
            control={control}
            name="password"
            label="Nova Senha"
            placeholder="Digite sua nova senha"
            errors={validationErrors}
            secureTextEntry
            editable={!isLoading}
          />

          <ControlledInput
            control={control}
            name="passwordConfirmation"
            label="Confirmação de Senha"
            placeholder="Digite sua senha novamente"
            errors={validationErrors}
            secureTextEntry
            editable={!isLoading}
          />

          {/* Submit Button */}
          <TouchableOpacity
            className="py-4 rounded-xl mt-4"
            style={{
              backgroundColor: isLoading ? Colors.primary.light : Colors.primary.DEFAULT,
            }}
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.primary.foreground} />
            ) : (
              <Text className="text-base font-semibold text-center" style={{ color: Colors.primary.foreground }}>
                Redefinir Senha
              </Text>
            )}
          </TouchableOpacity>

          {/* Back to Login */}
          <TouchableOpacity
            className="items-center mt-4"
            onPress={() => router.replace('/(auth)/auth')}
          >
            <View className="flex-row items-center">
              <MaterialIcons
                name="arrow-back"
                size={16}
                color={Colors.primary.DEFAULT}
                style={{ marginRight: 6 }}
              />
              <Text className="text-sm font-medium" style={{ color: Colors.primary.DEFAULT }}>
                Voltar para o login
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
