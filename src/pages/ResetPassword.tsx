import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth-store";
import { Sparkles, Lock, Eye, EyeOff, AlertCircle, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const passwordRules = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One number", test: (p: string) => /[0-9]/.test(p) },
  { label: "One special character", test: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { updatePassword } = useAuthStore();
  const navigate = useNavigate();

  const allPass = passwordRules.every((r) => r.test(password));
  const match = password === confirmPassword && confirmPassword.length > 0;

  // Check for recovery token in URL
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.includes("type=recovery")) {
      // No recovery token — redirect
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allPass || !match) return;
    setError(null);
    setIsLoading(true);
    const { error: err } = await updatePassword(password);
    setIsLoading(false);
    if (err) {
      setError(err);
    } else {
      toast.success("Password updated!");
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Sparkles className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">New Password</h1>
          <p className="text-muted-foreground text-sm mt-1">Choose a new secure password</p>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 card-hover">
          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-destructive/10 text-destructive text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /><span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {password && (
                <div className="space-y-1 mt-2">
                  {passwordRules.map((rule) => {
                    const pass = rule.test(password);
                    return (
                      <div key={rule.label} className="flex items-center gap-1.5 text-xs">
                        {pass ? <Check className="w-3 h-3 text-emerald-500" /> : <X className="w-3 h-3 text-destructive" />}
                        <span className={pass ? "text-emerald-500" : "text-muted-foreground"}>{rule.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm Password</Label>
              <Input id="confirm" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              {confirmPassword && !match && <p className="text-xs text-destructive mt-1">Passwords do not match</p>}
            </div>

            <Button type="submit" variant="gradient" className="w-full" disabled={!allPass || !match || isLoading}>
              {isLoading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
