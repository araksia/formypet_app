
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
// import forMyPetLogo from '@/assets/formypet-logo.png';

const LoginPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        navigate('/');
      }
    };
    checkUser();

    // Load saved credentials
    const savedEmail = localStorage.getItem('formypet_email');
    const savedPassword = localStorage.getItem('formypet_password');
    const savedRemember = localStorage.getItem('formypet_remember') === 'true';
    
    if (savedRemember && savedEmail && savedPassword) {
      setFormData({ email: savedEmail, password: savedPassword });
      setRememberMe(true);
    }
  }, [navigate]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error with Google login:', error);
      toast({
        title: "Σφάλμα",
        description: "Υπήρξε πρόβλημα με την σύνδεση μέσω Google",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };


  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast({
        title: "Σφάλμα",
        description: "Παρακαλώ συμπληρώστε όλα τα πεδία",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      if (error) throw error;

      // Save credentials if remember me is checked
      if (rememberMe) {
        localStorage.setItem('formypet_email', formData.email);
        localStorage.setItem('formypet_password', formData.password);
        localStorage.setItem('formypet_remember', 'true');
      } else {
        localStorage.removeItem('formypet_email');
        localStorage.removeItem('formypet_password');
        localStorage.removeItem('formypet_remember');
      }

      navigate('/');
    } catch (error: any) {
      console.error('Error with email login:', error);
      toast({
        title: "Σφάλμα",
        description: error.message || "Υπήρξε πρόβλημα με την σύνδεση",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <img 
            src="/lovable-uploads/584817ec-4bac-4790-9f6a-4ee9103f1bbf.png" 
            alt="For my pet logo" 
            className="h-16 w-16 mx-auto"
          />
          <CardTitle className="text-2xl font-bold">For my pet</CardTitle>
          <p className="text-muted-foreground">Φροντίδα κατοικιδίων στην Ελλάδα</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Social Login Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full h-12 flex items-center justify-center gap-3"
              variant="outline"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {loading ? 'Σύνδεση...' : 'Σύνδεση με Google'}
            </Button>

          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">ή</span>
            </div>
          </div>

          {/* Email Login Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Κωδικός</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="remember" 
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <Label htmlFor="remember" className="text-sm">
                Θυμήσου με
              </Label>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12"
            >
              <LogIn className="h-4 w-4 mr-2" />
              {loading ? 'Σύνδεση...' : 'Σύνδεση'}
            </Button>
          </form>

          {/* Forgot Password Link */}
          <div className="text-center">
            <Link
              to="/reset-password"
              className="text-sm text-primary underline-offset-4 hover:underline"
            >
              Ξέχασα τον κωδικό μου
            </Link>
          </div>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Δεν έχετε λογαριασμό; </span>
            <Link
              to="/signup"
              className="text-primary underline-offset-4 hover:underline"
            >
              Εγγραφή
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
