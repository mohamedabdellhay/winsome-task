import { cookies } from "next/headers";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export async function getServerToken() {
  const cookieStore = await cookies();
  return cookieStore.get(TOKEN_KEY)?.value || null;
}

export async function getServerUser() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get(USER_KEY)?.value;
  if (!userCookie) return null;
  
  try {
    return JSON.parse(decodeURIComponent(userCookie));
  } catch (e) {
    return null;
  }
}

export async function isServerAdmin() {
  const user = await getServerUser();
  return user?.role === "ADMIN";
}
