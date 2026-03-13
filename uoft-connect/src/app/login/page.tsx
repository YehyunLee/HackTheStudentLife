"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth-context";
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Loader2,
  GraduationCap,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signUp, confirmSignUp } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Sign In state
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");

  // Sign Up state
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await signIn(signInEmail, signInPassword);
      router.push("/feed");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to sign in";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Validate UofT email
    const email = signUpEmail.toLowerCase();
    if (!email.endsWith("@utoronto.ca") && !email.endsWith("@mail.utoronto.ca")) {
      setError("Please use your UofT email address (@utoronto.ca or @mail.utoronto.ca)");
      setIsLoading(false);
      return;
    }

    try {
      const result = await signUp(signUpEmail, signUpPassword, signUpName);
      if (result.needsConfirmation) {
        setNeedsConfirmation(true);
        setSuccess("Check your email for a verification code!");
      } else {
        router.push("/feed");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to sign up";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await confirmSignUp(signUpEmail, confirmationCode);
      await signIn(signUpEmail, signUpPassword);
      router.push("/feed");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to confirm";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#002A5C] via-[#003d82] to-[#1a5fb4] flex items-center justify-center p-4 text-white">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-lg">
              <span className="text-xl font-bold text-white">U</span>
            </div>
            <span className="text-2xl font-bold text-white">UofT Connect</span>
          </Link>
          <p className="mt-2 text-white text-sm">
            Sign in with your UofT email to continue
          </p>
        </div>

        <Card className="shadow-2xl">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <GraduationCap className="h-5 w-5 text-[#002A5C]" />
              <Badge className="bg-[#002A5C]/10 text-white text-xs">
                UofT Members Only
              </Badge>
            </div>
            <CardTitle className="text-center text-lg">
              Welcome to UofT Connect
            </CardTitle>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-600">
                <CheckCircle className="h-4 w-4 shrink-0" />
                {success}
              </div>
            )}

            {needsConfirmation ? (
              <form onSubmit={handleConfirmSignUp} className="space-y-4">
                <div className="text-center mb-4">
                  <p className="text-sm text-white">
                    We sent a verification code to <strong>{signUpEmail}</strong>
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">
                    Verification Code
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={confirmationCode}
                    onChange={(e) => setConfirmationCode(e.target.value)}
                    className="text-center text-lg tracking-widest"
                    maxLength={6}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-[#002A5C] hover:bg-[#002A5C]/90"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Verify & Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <Tabs defaultValue="signin" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="signin">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white">
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70" />
                        <Input
                          type="email"
                          placeholder="you@mail.utoronto.ca"
                          value={signInEmail}
                          onChange={(e) => setSignInEmail(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70" />
                        <Input
                          type="password"
                          placeholder="••••••••"
                          value={signInPassword}
                          onChange={(e) => setSignInPassword(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-[#002A5C] hover:bg-[#002A5C]/90"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          Sign In
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70" />
                        <Input
                          type="text"
                          placeholder="Your full name"
                          value={signUpName}
                          onChange={(e) => setSignUpName(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white">
                        UofT Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70" />
                        <Input
                          type="email"
                          placeholder="you@mail.utoronto.ca"
                          value={signUpEmail}
                          onChange={(e) => setSignUpEmail(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                      <p className="text-xs text-white">
                        Must be @utoronto.ca or @mail.utoronto.ca
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70" />
                        <Input
                          type="password"
                          placeholder="Min 8 chars, uppercase, number"
                          value={signUpPassword}
                          onChange={(e) => setSignUpPassword(e.target.value)}
                          className="pl-10"
                          minLength={8}
                          required
                        />
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-[#002A5C] hover:bg-[#002A5C]/90"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          Create Account
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-white">
          By signing in, you agree to our Terms of Service and Privacy Policy.
          <br />
          Built at Hack the Student Life 2026
        </p>
      </div>
    </div>
  );
}
