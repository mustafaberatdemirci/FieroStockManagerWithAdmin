import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../context/AuthContext';
import { loginSchema, type LoginFormData } from '../schemas/validation';
import { FormField, FormInput, FormButton, useFormFieldState } from '../components/ui/FormField';

export function LoginPage() {
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    watch,
    setError: setFormError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange', // Real-time validation
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const watchedValues = watch();
  const emailState = useFormFieldState(watchedValues.email, errors.email?.message);
  const passwordState = useFormFieldState(watchedValues.password, errors.password?.message);

  const onSubmit = async (data: LoginFormData) => {
    setServerError('');
    
    try {
      await login(data.email, data.password);
      // Redirect based on role (check email for admin)
      if (data.email.includes('admin')) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Geçersiz kullanıcı adı veya şifre';
      setServerError(errorMessage);
      
      // Set field-specific errors if needed
      if (errorMessage.includes('email') || errorMessage.includes('kullanıcı')) {
        setFormError('email', { message: 'Geçersiz email adresi' });
      } else if (errorMessage.includes('password') || errorMessage.includes('şifre')) {
        setFormError('password', { message: 'Geçersiz şifre' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <img 
            src="/logo.png" 
            alt="Logo" 
            className="h-24 w-auto object-contain"
            style={{ 
              filter: 'brightness(1.1) contrast(1.1)',
              mixBlendMode: 'multiply'
            }} 
          />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Kahve Stok Yönetimi
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Email Field */}
            <FormField
              label="Email Adresi"
              error={errors.email?.message}
              success={emailState.success}
              required
              helpText="Örn: demo@fierocoffee.com"
            >
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <FormInput
                  {...register('email')}
                  type="email"
                  placeholder="Email adresinizi girin"
                  error={!!errors.email}
                  success={emailState.success}
                  className="pl-10"
                />
              </div>
            </FormField>

            {/* Password Field */}
            <FormField
              label="Şifre"
              error={errors.password?.message}
              success={passwordState.success}
              required
              helpText="En az 6 karakter"
            >
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <FormInput
                  {...register('password')}
                  type={showPassword ? "text" : "password"}
                  placeholder="Şifrenizi girin"
                  error={!!errors.password}
                  success={passwordState.success}
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </FormField>

            {/* Server Error Display */}
            {serverError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-sm text-red-600">{serverError}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <FormButton
              type="submit"
              loading={isSubmitting}
              disabled={!isValid || isSubmitting}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </FormButton>
          </form>
        </div>
      </div>
    </div>
  );
}
