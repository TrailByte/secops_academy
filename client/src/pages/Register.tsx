import { useState } from "react";
import { Link, useLocation } from "wouter";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRegister } from "@/hooks/use-auth";
import { Shield, AlertCircle } from "lucide-react";

export default function Register() {
  const [, navigate] = useLocation();
  const register = useRegister();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [localError, setLocalError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    if (password.length < 8) {
      setLocalError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setLocalError("Passwords don't match.");
      return;
    }
    register.mutate(
      { email, password },
      { onSuccess: () => {
          localStorage.removeItem("seenIntro");
          navigate("/");
        }
      }
    );
  };

  return (
    <Layout>
      <div className="max-w-sm mx-auto py-12">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-display font-bold tracking-tight mb-1">Create account</h1>
          <p className="text-sm text-muted-foreground">Track your progress, ranks, and flags.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block">
              Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block">
              Password
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              placeholder="At least 8 characters"
            />
          </div>
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block">
              Confirm password
            </label>
            <Input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              autoComplete="new-password"
              placeholder="••••••••"
            />
          </div>

          {(localError || register.isError) && (
            <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {localError || (register.error instanceof Error ? register.error.message : "Registration failed")}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={register.isPending}>
            {register.isPending ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link href="/login">
            <span className="text-primary hover:underline cursor-pointer">Sign in</span>
          </Link>
        </p>
      </div>
    </Layout>
  );
}
