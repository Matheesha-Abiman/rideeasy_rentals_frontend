import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { api, AuthResponse } from "@/lib/api";

interface User {
  email: string;
  roles: string[];
  firstname?: string;
  lastname?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstname: string, lastname: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.login({ email, password });
    if (response.data.accessToken) {
      localStorage.setItem("authToken", response.data.accessToken);
      const userData = { 
        email: response.data.email, 
        roles: response.data.roles 
      };
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    }
  };

  const register = async (email: string, password: string, firstname: string, lastname: string) => {
    const response = await api.register({ email, password, firstname, lastname });
    const userData = { 
      email: response.data.email, 
      roles: response.data.roles,
      firstname,
      lastname
    };
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
