import { z } from 'zod'

// Schemas simplificados sem dependência de tradução
export const sendCodeSchema = z.object({
  email: z.string().email('validation.emailFormat'),
})

export const verifyCodeSchema = z.object({
  email: z.string().email('validation.emailFormat'),
  code: z.string().length(6, 'validation.codeLength'),
})

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'validation.required'),
})
