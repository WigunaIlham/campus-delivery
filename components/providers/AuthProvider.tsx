"use client";

import {createContext, useContext, useEffect, useState} from "react";
import {supabase} from "@/lib/supabase/client";
import {User} from "@/types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({children}: {children: React.ReactNode}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: {session},
      } = await supabase.auth.getSession();

      if (session?.user) {
        const {data: profile} = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profile) {
          setUser({
            id: profile.id,
            email: session.user.email!,
            role: profile.role,
            full_name: profile.full_name,
            phone: profile.phone,
            address: profile.address,
            created_at: profile.created_at,
          });
        }
      }
      setLoading(false);
    };

    getUser();

    const {
      data: {subscription},
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const {data: profile} = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profile) {
          setUser({
            id: profile.id,
            email: session.user.email!,
            role: profile.role,
            full_name: profile.full_name,
            phone: profile.phone,
            address: profile.address,
            created_at: profile.created_at,
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{user, loading, signOut}}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
