import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'O campo E-mail é obrigatório.' })
    .min(1, 'O campo E-mail é obrigatório.')
    .email('O campo E-mail deve ser um endereço de e-mail válido.'),
  password: z
    .string({ required_error: 'O campo Senha é obrigatório.' })
    .min(1, 'O campo Senha é obrigatório.')
    .min(8, 'O campo Senha deve ter pelo menos 8 caracteres.'),
});

export const registerSchema = z
  .object({
    name: z
      .string({ required_error: 'O campo Nome é obrigatório.' })
      .min(1, 'O campo Nome é obrigatório.')
      .min(3, 'O campo Nome deve ter pelo menos 3 caracteres.')
      .max(100, 'O campo Nome deve ter no máximo 64 caracteres.'),
    email: z
      .string({ required_error: 'O campo E-mail é obrigatório.' })
      .min(1, 'O campo E-mail é obrigatório.')
      .email('O campo E-mail deve ser um endereço de e-mail válido.'),
    password: z
      .string({ required_error: 'O campo Senha é obrigatório.' })
      .min(1, 'O campo Senha é obrigatório.')
      .min(8, 'O campo Senha deve ter pelo menos 8 caracteres.')
      .max(64, 'O campo Senha deve ter no máximo 64 caracteres.'),
    passwordConfirmation: z
      .string({ required_error: 'O campo Confirmação de Senha é obrigatório.' })
      .min(1, 'O campo Confirmação de Senha é obrigatório.')
      .min(8, 'O campo Confirmação de Senha deve ter pelo menos 8 caracteres.')
      .max(64, 'O campo Confirmação de Senha deve ter no máximo 64 caracteres.'),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: 'O campo Confirmação de Senha de confirmação não confere.',
    path: ['passwordConfirmation'],
  });

export const forgotPasswordSchema = z.object({
  email: z
    .string({ required_error: 'O campo E-mail é obrigatório.' })
    .min(1, 'O campo E-mail é obrigatório.')
    .email('O campo E-mail deve ser um endereço de e-mail válido.'),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string({ required_error: 'O campo Nova Senha é obrigatório.' })
      .min(1, 'O campo Nova Senha é obrigatório.')
      .min(8, 'O campo Nova Senha deve ter pelo menos 8 caracteres.')
      .max(64, 'O campo Nova Senha deve ter no máximo 64 caracteres.'),
    passwordConfirmation: z
      .string({ required_error: 'O campo Confirmação de Senha é obrigatório.' })
      .min(1, 'O campo Confirmação de Senha é obrigatório.')
      .min(8, 'O campo Confirmação de Senha deve ter pelo menos 8 caracteres.')
      .max(64, 'O campo Confirmação de Senha deve ter no máximo 64 caracteres.'),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: 'O campo Confirmação de Senha não confere.',
    path: ['passwordConfirmation'],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
