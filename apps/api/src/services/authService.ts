import jwt from 'jsonwebtoken'
import { api } from '../../convex/_generated/api'
import type { Doc, Id } from '../../convex/_generated/dataModel'
import { convexClient } from '../lib/convex'
import { emailService } from './emailService'

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret'

class AuthService {
  // Gerar código de 6 dígitos
  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  // Validar email
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Enviar código de verificação
  async sendVerificationCode(email: string): Promise<{ success: boolean; messageKey: string }> {
    if (!this.isValidEmail(email)) {
      return { success: false, messageKey: 'auth.errors.invalidEmail' }
    }

    try {
      const recentAttempts = await convexClient.query(api.db.auth.authCodes.getRecentAttempts, {
        email,
      })

      if (recentAttempts >= 3) {
        return {
          success: false,
          messageKey: 'auth.errors.tooManyAttempts',
        }
      }

      const code = this.generateVerificationCode()
      const expiresAt = Date.now() + 10 * 60 * 1000 // 10 minutos

      // Criar código no Convex
      await convexClient.mutation(api.db.auth.authCodes.createVerificationCode, {
        email,
        code,
        expiresAt,
      })

      // Enviar email
      await emailService.sendVerificationCode(email, code)
      return { success: true, messageKey: 'auth.success.codeSent' }
    } catch (error) {
      console.error('Erro ao enviar código:', error)
      return { success: false, messageKey: 'auth.errors.emailSendError' }
    }
  }

  // Verificar código e fazer login
  async verifyCodeAndLogin(
    email: string,
    code: string
  ): Promise<{
    success: boolean
    messageKey: string
    tokens?: AuthTokens
    user?: Omit<Doc<'users'>, '_id'> & { id: string }
    isNewUser?: boolean
  }> {
    try {
      // Verificar código no Convex
      const codeResult = await convexClient.mutation(api.db.auth.authCodes.verifyAndUseCode, {
        email,
        code,
      })

      if (!codeResult.success) {
        // Temporary fallback until Convex functions are updated to return messageKey
        return { success: false, messageKey: 'auth.errors.invalidCode' }
      }

      // Buscar ou criar usuário
      let user = await convexClient.query(api.db.users.getUserByEmail, { email })
      let isNewUser = false

      if (!user) {
        // Criar novo usuário
        const userId = await convexClient.mutation(api.db.users.createUser, { email })
        user = await convexClient.query(api.db.users.getUserById, { userId })
        isNewUser = true

        // Enviar email de boas-vindas (não aguardar)
        emailService.sendWelcomeEmail(email).catch(error => {
          console.error('[Error][AuthService] Error sending welcome email:', error)
        })
      } else {
        // Atualizar último login
        await convexClient.mutation(api.db.users.updateLastLogin, { userId: user._id })
      }

      if (!user) {
        return { success: false, messageKey: 'auth.errors.userCreateError' }
      }

      // Gerar tokens
      const tokens = await this.generateTokens(user._id)

      return {
        success: true,
        messageKey: 'auth.success.loginSuccess',
        tokens,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
          _creationTime: user._creationTime,
          updatedAt: user.updatedAt,
          isActive: user.isActive,
          lastLoginAt: user.lastLoginAt,
          profilePicture: user.profilePicture,
        },
        isNewUser,
      }
    } catch (error) {
      console.error('Erro no login:', error)
      return { success: false, messageKey: 'auth.errors.serverError' }
    }
  }

  // Gerar tokens JWT
  private async generateTokens(userId: Id<'users'>): Promise<AuthTokens> {
    const accessToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '15m' })

    const refreshToken = jwt.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: '7d' })

    // Salvar refresh token no Convex
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 dias
    await convexClient.mutation(api.db.auth.refreshTokens.createRefreshToken, {
      token: refreshToken,
      userId,
      expiresAt,
    })

    return { accessToken, refreshToken }
  }

  // Verificar access token
  verifyAccessToken(token: string): { userId: string } | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
      return decoded
    } catch (error) {
      return null
    }
  }

  // Refresh token
  async refreshAccessToken(refreshToken: string): Promise<{
    success: boolean
    accessToken?: string
    messageKey: string
  }> {
    try {
      // Verificar refresh token no Convex
      const tokenData = await convexClient.query(api.db.auth.refreshTokens.getRefreshToken, {
        token: refreshToken,
      })

      if (!tokenData) {
        return { success: false, messageKey: 'auth.errors.invalidRefreshToken' }
      }

      // Gerar novo access token
      const accessToken = jwt.sign({ userId: tokenData.userId }, JWT_SECRET, { expiresIn: '15m' })

      return { success: true, accessToken, messageKey: 'auth.success.tokenRefreshed' }
    } catch (error) {
      console.error('Erro ao renovar token:', error)
      return { success: false, messageKey: 'auth.errors.serverError' }
    }
  }

  // Buscar usuário por ID
  async getUserById(userId: string): Promise<Doc<'users'> | null> {
    try {
      return await convexClient.query(api.db.users.getUserById, {
        userId: userId as Id<'users'>,
      })
    } catch (error) {
      console.error('Erro ao buscar usuário:', error)
      return null
    }
  }

  // Logout
  async logout(refreshToken: string): Promise<void> {
    try {
      await convexClient.mutation(api.db.auth.refreshTokens.revokeRefreshToken, {
        token: refreshToken,
      })
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  // Métodos de limpeza (para cron jobs futuros)
  async cleanupExpiredCodes(): Promise<{ cleaned: number }> {
    try {
      return await convexClient.mutation(api.db.auth.authCodes.cleanupExpiredCodes, {})
    } catch (error) {
      console.error('Erro ao limpar códigos:', error)
      return { cleaned: 0 }
    }
  }

  async cleanupExpiredTokens(): Promise<{ cleaned: number }> {
    try {
      return await convexClient.mutation(api.db.auth.refreshTokens.cleanupExpiredTokens, {})
    } catch (error) {
      console.error('Erro ao limpar tokens:', error)
      return { cleaned: 0 }
    }
  }

  // Revogar todos os tokens de um usuário (útil para security)
  async revokeAllUserTokens(userId: string): Promise<{ revoked: number }> {
    try {
      return await convexClient.mutation(api.db.auth.refreshTokens.revokeAllUserTokens, {
        userId: userId as Id<'users'>,
      })
    } catch (error) {
      console.error('Erro ao revogar tokens:', error)
      return { revoked: 0 }
    }
  }
}

export const authService = new AuthService()
