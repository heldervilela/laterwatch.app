import type { LocaleStructure } from '../types'

export const en: LocaleStructure = {
  auth: {
    errors: {
      invalidEmail: 'Invalid email',
      expiredCode: 'Expired code',
      invalidCode: 'Invalid code',
      codeUsed: 'Code has already been used',
      codeNotFound: 'Code not found',
      tooManyAttempts: 'Too many attempts. Try again in 1 hour.',
      unauthorized: 'Invalid or expired access token',
      invalidRefreshToken: 'Invalid or expired refresh token',
      serverError: 'Internal server error',
      emailSendError: 'Error sending email',
      userCreateError: 'Error creating/fetching user',
    },
    success: {
      codeSent: 'Code sent successfully',
      loginSuccess: 'Login successful',
      tokenRefreshed: 'Token refreshed',
      logoutSuccess: 'Logout successful',
    },
  },
  validation: {
    required: 'Required field',
    emailFormat: 'Invalid email',
    codeLength: 'Code must be 6 digits',
    minLength: 'Value too short',
  },
  user: {
    success: {
      profileLoaded: 'Profile loaded successfully',
    },
    error: {
      onboardingStatus: 'Failed to check onboarding status',
    },
  },
  businesses: {
    success: {
      created_successfully: 'Business created successfully',
      updated_successfully: 'Business updated successfully',
      phone_updated_successfully: 'Phone number updated successfully',
      deactivated_successfully: 'Business deactivated successfully',
      reactivated_successfully: 'Business reactivated successfully',
    },
    errors: {
      name_already_exists: 'A business with this name already exists',
      user_already_has_business: 'User already has an associated business',
      phone_already_in_use: 'Phone number is already in use',
      create_failed: 'Failed to create business',
      update_failed: 'Failed to update business',
      upsert_failed: 'Failed to save business',
      fetch_failed: 'Failed to load business',
      not_found: 'Business not found',
      phone_update_failed: 'Failed to update phone number',
      deactivate_failed: 'Failed to deactivate business',
      reactivate_failed: 'Failed to reactivate business',
    },
  },
}
