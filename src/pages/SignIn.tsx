import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/contexts/AppContext';
import { useTranslation } from '@/lib/i18n';
import { toast } from 'sonner';
import logo from '@/assets/logo.png';

const SignIn = () => {
  const { language, setUser } = useApp();
  const t = useTranslation(language);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { api } = await import('@/lib/api');
      const response = await api.signIn({ email, password });
      
      localStorage.setItem('token', response.token);
      setUser(response.user);
      toast.success('Welcome back!');
      
      // Redirect to owner dashboard if owner
      if (response.user.role === 'owner') {
        navigate('/owner');
      } else {
      navigate('/');
      }
    } catch (error: any) {
      toast.error(error.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="bg-card rounded-2xl border border-border shadow-soft p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-block">
              <img src={logo} alt="GS Grocery Shop" className="h-16 w-16 mx-auto mb-4" />
            </Link>
            <h1 className="text-2xl font-bold text-foreground">{t('signIn')}</h1>
            <p className="text-muted-foreground mt-2">Welcome back to GS Grocery</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="email">{t('email')}</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">{t('password')}</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <Link to="#" className="text-sm text-primary hover:underline">
                {t('forgotPassword')}
              </Link>
            </div>

            <Button variant="hero" className="w-full" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : t('signIn')}
            </Button>
          </form>

          {/* Sign Up Link */}
          <p className="text-center mt-6 text-muted-foreground">
            {t('dontHaveAccount')}{' '}
            <Link to="/signup" className="text-primary font-semibold hover:underline">
              {t('signUp')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
