import { useState } from "react";
import { Link, useLocation } from "wouter";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLogin } from "@/hooks/use-auth";
import { Shield, AlertCircle } from "lucide-react";

export default function Login() {
  const [, navigate] = useLocation();
  const login = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate(
      { email, password },
      { onSuccess: () => navigate("/") }
    );
  };

  return (
    <Layout>
      <div className="max-w-sm mx-auto py-12">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-display font-bold tracking-tight mb-1">Sign in</h1>
          <p className="text-sm text-muted-foreground">Welcome back, agent.</p>
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
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </div>

          {login.isError && (
            <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {login.error instanceof Error ? login.error.message : "Login failed"}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={login.isPending}>
            {login.isPending ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          No account yet?{" "}
          <Link href="/register">
            <span className="text-primary hover:underline cursor-pointer">Create one</span>
          </Link>
        </p>
        <p className="text-center text-xs text-muted-foreground/60 mt-2">
          Or{" "}
          <Link href="/">
            <span className="hover:text-foreground cursor-pointer underline">continue as guest</span>
          </Link>
          {" "}- progress won't be saved.
        </p>
      </div>
    </Layout>
  );
}
