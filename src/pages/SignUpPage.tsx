import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff } from "lucide-react";
import { useAnalytics, analyticsEvents } from "@/hooks/useAnalytics";

export const SignUpPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { trackEvent, trackScreenView } = useAnalytics();

  // Track screen view
  useEffect(() => {
    trackScreenView('Sign Up');
  }, [trackScreenView]);
  

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Σφάλμα",
        description: "Οι κωδικοί πρόσβασης δεν ταιριάζουν",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Σφάλμα", 
        description: "Ο κωδικός πρόσβασης πρέπει να έχει τουλάχιστον 6 χαρακτήρες",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          },
        },
      });

      if (error) {
        toast({
          title: "Σφάλμα εγγραφής",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (data.user) {
        // Create profile
        const { error: profileError } = await supabase
          .from("profiles")
          .insert({
            user_id: data.user.id,
            display_name: displayName,
            email: email,
          });

        if (profileError) {
          console.error("Profile creation error:", profileError);
        }

        toast({
          title: "Επιτυχής εγγραφή!",
          description: "Ο λογαριασμός σας δημιουργήθηκε επιτυχώς.",
        });

        // Track signup event
        trackEvent(analyticsEvents.USER_SIGNUP, {
          method: 'email',
          user_id: data.user.id
        });

        navigate("/");
      }
    } catch (error: any) {
      toast({
        title: "Σφάλμα",
        description: "Παρουσιάστηκε σφάλμα κατά την εγγραφή",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Εγγραφή</CardTitle>
          <CardDescription className="text-center">
            Δημιουργήστε έναν νέο λογαριασμό
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">

          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Όνομα εμφάνισης</Label>
              <Input
                id="displayName"
                type="text"
                placeholder="Εισάγετε το όνομά σας"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="εισάγετε το email σας"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Κωδικός πρόσβασης</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Εισάγετε τον κωδικό σας"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Επιβεβαίωση κωδικού</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Επιβεβαιώστε τον κωδικό σας"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Δημιουργία λογαριασμού..." : "Εγγραφή"}
            </Button>
          </form>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Έχετε ήδη λογαριασμό; </span>
            <Link
              to="/login"
              className="text-primary underline-offset-4 hover:underline"
            >
              Σύνδεση
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};