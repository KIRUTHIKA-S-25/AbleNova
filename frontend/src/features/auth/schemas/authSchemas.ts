import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'Email address is required.').email('Please enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
  rememberMe: z.boolean().optional(),
});

export const signupSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required.'),
    lastName: z.string().min(1, 'Last name is required.'),
    displayName: z.string().optional(),
    email: z.string().min(1, 'Email address is required.').email('Please enter a valid email address.'),
    role: z.enum(['student', 'teacher', 'caregiver'], {
      message: 'Please select a role.',
    }),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long.')
      .regex(/[0-9]/, 'Password must contain at least one number.')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
      .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character.'),
    confirmPassword: z.string().min(1, 'Please confirm your password.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email address is required.').email('Please enter a valid email address.'),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long.')
      .regex(/[0-9]/, 'Password must contain at least one number.')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
      .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character.'),
    confirmPassword: z.string().min(1, 'Please confirm your password.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
