// Type structure for all locales
export type LocaleStructure = {
  auth: {
    errors: {
      invalidEmail: string
      expiredCode: string
      invalidCode: string
      codeUsed: string
      codeNotFound: string
      tooManyAttempts: string
      unauthorized: string
      invalidRefreshToken: string
      serverError: string
      emailSendError: string
      userCreateError: string
    }
    success: {
      codeSent: string
      loginSuccess: string
      tokenRefreshed: string
      logoutSuccess: string
    }
  }
  validation: {
    required: string
    emailFormat: string
    codeLength: string
    minLength: string
  }
  user: {
    success: {
      profileLoaded: string
    }
    error: {
      onboardingStatus: string
    }
  }
  businesses: {
    success: {
      created_successfully: string
      updated_successfully: string
      phone_updated_successfully: string
      deactivated_successfully: string
      reactivated_successfully: string
    }
    errors: {
      name_already_exists: string
      user_already_has_business: string
      phone_already_in_use: string
      create_failed: string
      update_failed: string
      upsert_failed: string
      fetch_failed: string
      not_found: string
      phone_update_failed: string
      deactivate_failed: string
      reactivate_failed: string
    }
  }
}
