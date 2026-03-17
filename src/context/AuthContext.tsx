import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { signUpWithEmailOrUsername } from "../api/auth";
import { supabase } from "../lib/supabase";
import { UserRole } from "../types";

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: UserRole;
  isAuthReady: boolean;
  user: any | null;
  login: (token: string, role?: UserRole) => Promise<void>;
  register: (
    email: string,
    password: string,
    fullName: string,
    phone: string,
  ) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<UserRole>(UserRole.User);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
  const [user, setUser] = useState<any | null>(null);
  const roleChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(
    null,
  );

  const SUPER_ADMIN_EMAILS: string = "admin@example.com";

  const isSuperAdmin = (email?: string | null) =>
    !!email && SUPER_ADMIN_EMAILS.includes(email.toLowerCase());

  const stopRoleSubscription = () => {
    if (roleChannelRef.current) {
      roleChannelRef.current.unsubscribe();
      roleChannelRef.current = null;
    }
  };

  const fetchUserRoleByEmail = async (
    email: string,
  ): Promise<UserRole | null> => {
    if (isSuperAdmin(email)) return UserRole.Admin;
    const { data: employeeData, error: employeeError } = await supabase
      .from("employees")
      .select("role")
      .eq("email", email)
      .maybeSingle();

    if (employeeError) {
      console.error("Failed to fetch employee role:", employeeError);
      return null;
    }

    if (!employeeError && employeeData?.role) {
      return employeeData.role as UserRole;
    }

    return null;
  };

  const subscribeToRoleChanges = (email: string) => {
    stopRoleSubscription();

    if (isSuperAdmin(email)) {
      setUserRole(UserRole.Admin);
      return;
    }

    const channel = supabase
      .channel(`role-changes-${email}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "employees",
          filter: `email=eq.${email}`,
        },
        async () => {
          const nextRole = await fetchUserRoleByEmail(email);
          if (nextRole) setUserRole(nextRole);
        },
      )
      .subscribe();

    roleChannelRef.current = channel;
  };

  const initializeAuthState = async () => {
    setIsAuthReady(false);
    const { data } = await supabase.auth.getSession();
    const hasSession = !!data.session;
    setIsAuthenticated(hasSession);

    if (hasSession) {
      const currentUser = data.session?.user || null;
      setUser(currentUser);

      const userEmail = data.session?.user?.email;
      if (userEmail) {
        if (isSuperAdmin(userEmail)) {
          setUserRole(UserRole.Admin);
        } else {
          const roleFromDb = await fetchUserRoleByEmail(userEmail);
          setUserRole(roleFromDb ?? UserRole.User);
          subscribeToRoleChanges(userEmail);
        }
      }
    } else {
      stopRoleSubscription();
      setUserRole(UserRole.User);
      setUser(null);
    }
    setIsAuthReady(true);
  };

  useEffect(() => {
    initializeAuthState();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const signedIn = !!session;
        setIsAuthenticated(signedIn);
        setUser(session?.user || null);

        const email = session?.user?.email;
        if (signedIn && email) {
          if (isSuperAdmin(email)) {
            setUserRole(UserRole.Admin);
          } else {
            fetchUserRoleByEmail(email).then((role) => {
              setUserRole(role ?? UserRole.User);
            });
            subscribeToRoleChanges(email);
          }
        } else {
          stopRoleSubscription();
          setUserRole(UserRole.User);
          setUser(null);
        }
      },
    );
    return () => {
      listener.subscription.unsubscribe();
      stopRoleSubscription();
    };
  }, []);

  const login = async (_token: string, _role?: UserRole) => {
    await initializeAuthState();
  };

  const register = async (
    email: string,
    password: string,
    fullName: string,
    phone: string,
  ) => {
    await signUpWithEmailOrUsername(email, password, fullName, phone);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    stopRoleSubscription();
    setIsAuthenticated(false);
    setUserRole(UserRole.User);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userRole,
        isAuthReady,
        user,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
