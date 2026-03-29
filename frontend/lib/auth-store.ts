"use client";

import { useSyncExternalStore } from "react";

const TOKEN_KEY = "token";

function subscribe(callback: () => void) {
  // Fires when token changes in other tabs/windows
  const onStorage = (e: StorageEvent) => {
    if (e.key === TOKEN_KEY) callback();
  };
  window.addEventListener("storage", onStorage);

  // Fires when token changes in this tab (we dispatch it manually)
  const onLocal = () => callback();
  window.addEventListener("auth-token-changed", onLocal);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("auth-token-changed", onLocal);
  };
}

function getSnapshot() {
  return localStorage.getItem(TOKEN_KEY);
}

function getServerSnapshot() {
  // Server render always has no access to localStorage
  return null;
}

export function useAuthToken() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function setAuthToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
  window.dispatchEvent(new Event("auth-token-changed"));
}

export function clearAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
  window.dispatchEvent(new Event("auth-token-changed"));
}