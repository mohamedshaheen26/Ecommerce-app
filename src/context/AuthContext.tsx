import { createContext, useContext, useState, type ReactNode } from "react";

enum UserRole {
  Admin = "admin",
  User = "user",
}

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: UserRole;
  login: (token: string, role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem("auth_token");
  });

  const [userRole, setUserRole] = useState<UserRole>(() => {
    return (localStorage.getItem("user_role") as UserRole) || UserRole.User;
  });

  const login = (token: string, role: UserRole) => {
    localStorage.setItem("auth_token", token);
    localStorage.setItem("user_role", role);
    setIsAuthenticated(true);
    setUserRole(role);
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_role");
    setIsAuthenticated(false);
    setUserRole(UserRole.User);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, login, logout }}>
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
