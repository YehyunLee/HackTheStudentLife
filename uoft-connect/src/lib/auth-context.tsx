"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  signUp,
  signIn,
  signOut,
  getCurrentUser,
  confirmSignUp,
  fetchUserAttributes,
  type SignUpInput,
  type SignInInput,
} from "aws-amplify/auth";
import { configureAmplify } from "./amplify-config";

interface User {
  username: string;
  email: string;
  userId?: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ needsConfirmation: boolean }>;
  confirmSignUp: (email: string, code: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    configureAmplify();
    checkUser();
  }, []);

  async function checkUser() {
    try {
      const currentUser = await getCurrentUser();
      const attributes = await fetchUserAttributes();
      setUser({
        username: currentUser.username,
        userId: currentUser.userId,
        email: attributes.email || "",
        name: attributes.name,
      });
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSignUp(email: string, password: string, name: string) {
    const input: SignUpInput = {
      username: email,
      password,
      options: {
        userAttributes: {
          email,
          name,
        },
      },
    };
    const result = await signUp(input);
    return { needsConfirmation: !result.isSignUpComplete };
  }

  async function handleConfirmSignUp(email: string, code: string) {
    await confirmSignUp({ username: email, confirmationCode: code });
  }

  async function handleSignIn(email: string, password: string) {
    const input: SignInInput = {
      username: email,
      password,
    };
    await signIn(input);
    await checkUser();
  }

  async function handleSignOut() {
    await signOut();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        signUp: handleSignUp,
        confirmSignUp: handleConfirmSignUp,
        signIn: handleSignIn,
        signOut: handleSignOut,
        refreshUser: checkUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
