const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export const getToken = () => {
  if (typeof window === "undefined") return null;
  const tokenFromStorage = window.localStorage.getItem(TOKEN_KEY);
  if (tokenFromStorage) {
    return tokenFromStorage;
  }

  const match = document.cookie.match(
    new RegExp("(^| )" + TOKEN_KEY + "=([^;]+)"),
  );
  return match ? decodeURIComponent(match[2]) : null;
};

export const setToken = (token: string) => {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(TOKEN_KEY, token);
    document.cookie = `${TOKEN_KEY}=${encodeURIComponent(token)}; path=/; max-age=${60 * 60 * 24 * 7}`;
  }
};

export const setUser = (user: any) => {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
    document.cookie = `${USER_KEY}=${encodeURIComponent(JSON.stringify(user))}; path=/; max-age=${60 * 60 * 24 * 7}`;
  }
};

export const getUser = () => {
  if (typeof window === "undefined") return null;
  const user = window.localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
};

export const clearToken = () => {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
    document.cookie = `${TOKEN_KEY}=; path=/; max-age=0`;
    document.cookie = `${USER_KEY}=; path=/; max-age=0`;
  }
};

export const isLoggedIn = () => Boolean(getToken());

export const isAdmin = () => {
  const user = getUser();
  return user?.role === "ADMIN";
};
