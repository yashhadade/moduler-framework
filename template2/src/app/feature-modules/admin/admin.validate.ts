import { z } from 'zod';

const stringRequired = (requiredMessage: string, typeMessage = 'Must be a string') =>
  z.string({
    error: (issue) =>
      (issue as { input?: unknown }).input === undefined ? requiredMessage : typeMessage,
  });

export const adminCreateSchema = z.object({
  name: stringRequired('name is required').min(1, 'Name is required'),
  email: stringRequired('email is required').email('Invalid email address'),
  isActive: z.boolean().optional(),
  password: stringRequired('Password is required')
    .min(8, 'Password must be at least 8 characters long')
    .refine((val) => /[A-Z]/.test(val), 'Password must contain at least one capital letter')
    .refine((val) => /[0-9]/.test(val), 'Password must contain at least one number')
    .refine(
      (val) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(val),
      'Password must contain at least one special character'
    ),
});

export const adminSetPasswordSchema = z.object({
  email: stringRequired('email is required').email('Invalid email address'),
  password: stringRequired('Password is required')
    .min(8, 'Password must be at least 8 characters long')
    .refine((val) => /[A-Z]/.test(val), 'Password must contain at least one capital letter')
    .refine((val) => /[0-9]/.test(val), 'Password must contain at least one number')
    .refine(
      (val) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(val),
      'Password must contain at least one special character'
    ),
});
