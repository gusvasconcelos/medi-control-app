import { ControlledInput } from '@/src/components';
import { Colors } from '@/src/constants/colors';
import { useToast } from '@/src/hooks/useToast';
import { ForgotPasswordFormData, forgotPasswordSchema } from '@/src/schemas';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { zodResolver } from '@hookform/resolvers/zod';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { forgotPassword } from '@/src/api/services/auth';
import type { ApiError } from '@/src/@types';

export default function ForgotPasswordScreen() {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setIsLoading(true);
      setValidationErrors(undefined);

      const response = await forgotPassword({ email: data.email });

      toast.success(response.message || 'E-mail enviado com sucesso! Verifique sua caixa de entrada.');

      // Wait a bit before navigating back to show the success message
      setTimeout(() => {
        router.back();
      }, 2000);
    } catch (err) {
      const error = err as ApiError;

      if (error.code === 'VALIDATION' && error.details) {
        setValidationErrors(error.details);
      }

      toast.error(error.message || 'Erro ao enviar e-mail. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

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
          Esqueci minha senha
        </Text>
        <Text className="text-sm text-muted-foreground dark:text-dark-muted-foreground text-center mb-8 leading-5">
          Digite seu e-mail e enviaremos um link para você redefinir sua senha
        </Text>

        {/* Form */}
        <View className="gap-2">
          <ControlledInput
            control={control}
            name="email"
            label="E-mail"
            placeholder="seu@email.com"
            errors={validationErrors}
            autoCapitalize="none"
            keyboardType="email-address"
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
                Enviar link de redefinição
              </Text>
            )}
          </TouchableOpacity>

          {/* Back to Login */}
          <TouchableOpacity className="items-center mt-4" onPress={() => router.back()}>
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
