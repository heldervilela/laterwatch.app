import type { LocaleStructure } from '../types'

export const pt: LocaleStructure = {
  auth: {
    errors: {
      invalidEmail: 'Email inválido',
      expiredCode: 'Código expirado',
      invalidCode: 'Código inválido',
      codeUsed: 'Código já foi utilizado',
      codeNotFound: 'Código não encontrado',
      tooManyAttempts: 'Demasiadas tentativas. Tente novamente em 1 hora.',
      unauthorized: 'Token de acesso inválido ou expirado',
      invalidRefreshToken: 'Token de actualização inválido ou expirado',
      serverError: 'Erro interno do servidor',
      emailSendError: 'Erro ao enviar email',
      userCreateError: 'Erro ao criar/buscar utilizador',
    },
    success: {
      codeSent: 'Código enviado com sucesso',
      loginSuccess: 'Início de sessão realizado com sucesso',
      tokenRefreshed: 'Token actualizado',
      logoutSuccess: 'Término de sessão realizado com sucesso',
    },
  },
  validation: {
    required: 'Campo obrigatório',
    emailFormat: 'Email inválido',
    codeLength: 'Código deve ter 6 dígitos',
    minLength: 'Valor demasiado curto',
  },
  user: {
    success: {
      profileLoaded: 'Perfil carregado com sucesso',
    },
    error: {
      onboardingStatus: 'Erro ao verificar estado de onboarding',
    },
  },
  businesses: {
    success: {
      created_successfully: 'Negócio criado com sucesso',
      updated_successfully: 'Negócio actualizado com sucesso',
      phone_updated_successfully: 'Número de telefone actualizado com sucesso',
      deactivated_successfully: 'Negócio desactivado com sucesso',
      reactivated_successfully: 'Negócio reactivado com sucesso',
    },
    errors: {
      name_already_exists: 'Já existe um negócio com este nome',
      user_already_has_business: 'Utilizador já tem um negócio associado',
      phone_already_in_use: 'Número de telefone já está em uso',
      create_failed: 'Erro ao criar negócio',
      update_failed: 'Erro ao actualizar negócio',
      upsert_failed: 'Erro ao guardar negócio',
      fetch_failed: 'Erro ao carregar negócio',
      not_found: 'Negócio não encontrado',
      phone_update_failed: 'Erro ao actualizar número de telefone',
      deactivate_failed: 'Erro ao desactivar negócio',
      reactivate_failed: 'Erro ao reactivar negócio',
    },
  },
}

export type Locale = typeof pt
