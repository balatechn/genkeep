import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { authApi } from '@/api';
import { useAuthStore } from '@/store/auth.store';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';

interface FormData { email: string; password: string; }

export default function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  async function onSubmit(data: FormData) {
    setLoading(true);
    try {
      const res = await authApi.login(data.email, data.password);
      setAuth(res.data.user, res.data.accessToken, res.data.refreshToken);
      navigate('/', { replace: true });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Login failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4 shadow-lg shadow-primary-600/30">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">GenKeep</h1>
          <p className="text-slate-400 mt-2">Password Generator & Keeper</p>
        </div>

        {/* Card */}
        <div className="card">
          <h2 className="text-xl font-semibold text-white mb-6">Sign in</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="admin@genkeep.local"
              error={errors.email?.message}
              {...register('email', { required: 'Email is required' })}
            />
            <Input
              label="Password"
              type={showPw ? 'text' : 'password'}
              placeholder="••••••••"
              error={errors.password?.message}
              suffix={
                <button type="button" onClick={() => setShowPw(!showPw)} className="text-slate-400 hover:text-white">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              {...register('password', { required: 'Password is required' })}
            />
            <Button type="submit" loading={loading} className="w-full justify-center py-3 mt-2">
              Sign in
            </Button>
          </form>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          GenKeep v1.0 · Internal use only
        </p>
      </div>
    </div>
  );
}
