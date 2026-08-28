"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import axios from "axios";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  address?: string;
  pincode?: string;
  zoneId?: string | null;
  isActive?: boolean;
  token: string;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  updateUser: (updatedData: Partial<User>) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  updateUser: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for user in cookies on initial load
    const storedUser = Cookies.get("userInfo");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        axios.defaults.headers.common["Authorization"] = `Bearer ${parsedUser.token}`;
        if (typeof window !== "undefined" && parsedUser.token) {
          localStorage.setItem("farmfresh_token", parsedUser.token);
        }
      } catch (err) {
        Cookies.remove("userInfo");
        if (typeof window !== "undefined") {
          localStorage.removeItem("farmfresh_token");
        }
      }
    }
    setLoading(false);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    Cookies.set("userInfo", JSON.stringify(userData), { expires: 30 }); // expires in 30 days
    axios.defaults.headers.common["Authorization"] = `Bearer ${userData.token}`;
    if (typeof window !== "undefined" && userData.token) {
      localStorage.setItem("farmfresh_token", userData.token);
    }
  };

  const updateUser = (updatedFields: Partial<User>) => {
    if (!user) return;
    const newUserData = { ...user, ...updatedFields };
    setUser(newUserData);
    Cookies.set("userInfo", JSON.stringify(newUserData), { expires: 30 });
    if (typeof window !== "undefined" && newUserData.token) {
      localStorage.setItem("farmfresh_token", newUserData.token);
    }
  };

  const logout = () => {
    setUser(null);
    Cookies.remove("userInfo");
    if (typeof window !== "undefined") {
      localStorage.removeItem("farmfresh_token");
    }
    delete axios.defaults.headers.common["Authorization"];
    window.location.href = "/login";
  };


  if (loading) return null;

  return (
    <AuthContext.Provider value={{ user, login, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

