/**
 * API Error class for standardized error handling
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Check if error is ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/**
 * Format error message for display
 */
export function formatErrorMessage(error: unknown, context?: 'login' | 'register'): string {
  if (isApiError(error)) {
    // Login için özel kontrol
    if (context === 'login') {
      const errorMessage = error.message.toLowerCase();
      if (
        errorMessage.includes('invalid') ||
        errorMessage.includes('geçersiz') ||
        errorMessage.includes('yanlış') ||
        errorMessage.includes('yanlis') ||
        errorMessage.includes('wrong') ||
        errorMessage.includes('incorrect') ||
        errorMessage.includes('password') ||
        errorMessage.includes('şifre') ||
        errorMessage.includes('sifre') ||
        errorMessage.includes('email') ||
        errorMessage.includes('e-posta') ||
        error.status === 401 ||
        error.status === 403
      ) {
        return 'Geçersiz e-posta veya şifre!';
      }
    }
    return error.message;
  }
  
  if (error instanceof Error) {
    // Login için özel kontrol
    if (context === 'login') {
      const errorMessage = error.message.toLowerCase();
      if (
        errorMessage.includes('invalid') ||
        errorMessage.includes('geçersiz') ||
        errorMessage.includes('yanlış') ||
        errorMessage.includes('yanlis') ||
        errorMessage.includes('wrong') ||
        errorMessage.includes('incorrect') ||
        errorMessage.includes('password') ||
        errorMessage.includes('şifre') ||
        errorMessage.includes('sifre') ||
        errorMessage.includes('email') ||
        errorMessage.includes('e-posta') ||
        errorMessage.includes('unauthorized') ||
        errorMessage.includes('401') ||
        errorMessage.includes('403')
      ) {
        return 'Geçersiz e-posta veya şifre!';
      }
    }
    
    // Register için e-posta zaten kayıtlı kontrolü
    if (context === 'register') {
      const errorMessage = error.message.toLowerCase();
      if (
        errorMessage.includes('email') ||
        errorMessage.includes('e-posta') ||
        errorMessage.includes('already') ||
        errorMessage.includes('exists') ||
        errorMessage.includes('kayıt') ||
        errorMessage.includes('kayit') ||
        errorMessage.includes('duplicate')
      ) {
        return 'Bu e-posta adresi daha önce kayıt edilmiş!';
      }
    }
    
    return error.message;
  }
  
  // Axios hatalarını kontrol et
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const axiosError = error as any;
    const status = axiosError.response?.status;
    const errorMessage = (axiosError.response?.data?.message || axiosError.response?.data?.error || '').toLowerCase();
    
    // Login için özel kontrol
    if (context === 'login') {
      if (
        status === 401 ||
        status === 403 ||
        errorMessage.includes('invalid') ||
        errorMessage.includes('geçersiz') ||
        errorMessage.includes('yanlış') ||
        errorMessage.includes('yanlis') ||
        errorMessage.includes('wrong') ||
        errorMessage.includes('incorrect') ||
        errorMessage.includes('password') ||
        errorMessage.includes('şifre') ||
        errorMessage.includes('sifre') ||
        errorMessage.includes('email') ||
        errorMessage.includes('e-posta') ||
        errorMessage.includes('unauthorized')
      ) {
        return 'Geçersiz e-posta veya şifre!';
      }
    }
    
    // Register için e-posta zaten kayıtlı kontrolü
    if (context === 'register' && (status === 400 || status === 409)) {
      if (
        errorMessage.includes('email') ||
        errorMessage.includes('e-posta') ||
        errorMessage.includes('already') ||
        errorMessage.includes('exists') ||
        errorMessage.includes('kayıt') ||
        errorMessage.includes('kayit') ||
        errorMessage.includes('duplicate')
      ) {
        return 'Bu e-posta adresi daha önce kayıt edilmiş!';
      }
    }
    
    // API'den gelen mesajı kullan
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }
    if (axiosError.response?.data?.error) {
      return axiosError.response.data.error;
    }
  }
  
  return 'Beklenmeyen bir hata oluştu';
}











