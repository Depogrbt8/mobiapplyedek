import { z } from 'zod';

// Kullanıcı doğrulama şemaları
export const userSchema = {
  register: z.object({
    name: z.string().min(2, 'İsim en az 2 karakter olmalıdır'),
    email: z.string().email('Geçerli bir e-posta adresi giriniz'),
    password: z
      .string()
      .min(8, 'Şifre en az 8 karakter olmalıdır')
      .regex(/[A-Z]/, 'Şifre en az bir büyük harf içermelidir')
      .regex(/[a-z]/, 'Şifre en az bir küçük harf içermelidir')
      .regex(/[0-9]/, 'Şifre en az bir rakam içermelidir'),
    confirmPassword: z.string()
  }).refine((data: { password: string; confirmPassword: string }) => data.password === data.confirmPassword, {
    message: 'Şifreler eşleşmiyor',
    path: ['confirmPassword']
  }),

  login: z.object({
    email: z.string().email('Geçerli bir e-posta adresi giriniz'),
    password: z.string().min(1, 'Şifre gereklidir')
  }),

  update: z.object({
    name: z.string().min(2, 'İsim en az 2 karakter olmalıdır').optional(),
    email: z.string().email('Geçerli bir e-posta adresi giriniz').optional(),
    currentPassword: z.string().optional(),
    newPassword: z.string()
      .min(8, 'Şifre en az 8 karakter olmalıdır')
      .regex(/[A-Z]/, 'Şifre en az bir büyük harf içermelidir')
      .regex(/[a-z]/, 'Şifre en az bir küçük harf içermelidir')
      .regex(/[0-9]/, 'Şifre en az bir rakam içermelidir')
      .optional(),
    confirmNewPassword: z.string().optional()
  }).refine((data: { newPassword?: string; confirmNewPassword?: string }) => {
    if (data.newPassword) {
      return data.newPassword === data.confirmNewPassword;
    }
    return true;
  }, {
    message: 'Şifreler eşleşmiyor',
    path: ['confirmNewPassword']
  })
};

// Rezervasyon doğrulama şemaları
export const reservationSchema = {
  create: z.object({
    type: z.enum(['flight', 'hotel', 'car', 'esim']),
    amount: z.number().positive('Tutar pozitif olmalıdır'),
    currency: z.string().length(3, 'Geçerli bir para birimi giriniz'),
    details: z.object({
      // Her rezervasyon tipi için özel alanlar
      passengers: z.array(z.object({
        name: z.string(),
        surname: z.string(),
        birthDate: z.string(),
        idNumber: z.string()
      })).optional(),
      dates: z.object({
        start: z.string(),
        end: z.string().optional()
      }).optional(),
      location: z.object({
        from: z.string().optional(),
        to: z.string().optional()
      }).optional()
    })
  }),

  update: z.object({
    status: z.enum(['pending', 'confirmed', 'cancelled']),
    amount: z.number().positive('Tutar pozitif olmalıdır').optional(),
    currency: z.string().length(3, 'Geçerli bir para birimi giriniz').optional()
  })
};

// Ödeme doğrulama şemaları
export const paymentSchema = {
  create: z.object({
    reservationId: z.string().uuid('Geçerli bir rezervasyon ID\'si giriniz'),
    amount: z.number().positive('Tutar pozitif olmalıdır'),
    currency: z.string().length(3, 'Geçerli bir para birimi giriniz'),
    provider: z.enum(['stripe', 'paypal']),
    paymentMethod: z.object({
      type: z.enum(['card', 'bank_transfer']),
      details: z.object({
        cardNumber: z.string().optional(),
        expiryMonth: z.string().optional(),
        expiryYear: z.string().optional(),
        cvv: z.string().optional(),
        holderName: z.string().optional()
      }).optional()
    })
  })
};

// Genel doğrulama fonksiyonu
export const validate = async <T>(schema: z.ZodType<T>, data: unknown): Promise<T> => {
  try {
    return await schema.parseAsync(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.errors[0].message);
    }
    throw new Error('Doğrulama hatası');
  }
}; 