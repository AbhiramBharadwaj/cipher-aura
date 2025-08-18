// src/hooks/useAuth.ts
import { useEffect, useState } from "react";

export type User = {
  id?: string;
  _id?: string;
  name?: string;
  full_name?: string;
  email?: string;
};

function readToken() {
  return localStorage.getItem("token") || "";
}

function readUser(): User | null {
  try {
    const raw = localStorage.getItem("user");
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function saveSession(token: string, user?: User) {
  localStorage.setItem("token", token);
  if (user) localStorage.setItem("user", JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export function getDisplayName(u?: User | null) {
  if (!u) return "";
  return u.full_name || u.name || u.email || "";
}

export function useAuth() {
  const [token, setToken] = useState<string>(readToken());
  const [user, setUser] = useState<User | null>(readUser());

  // Keep state in sync if something else updates localStorage
  useEffect(() => {
    const onStorage = () => {
      setToken(readToken());
      setUser(readUser());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const isAuthed = !!token;

  const logout = () => {
    clearSession();
    setToken("");
    setUser(null);
  };

  return { token, user, isAuthed, logout, setUser };
}
