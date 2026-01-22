export const setToken = (token: string): void => {
  localStorage.setItem("token", token);
};

export const getToken = (): string | null => {
  return localStorage.getItem("token");
};

export const deleteToken = (): void => {
  localStorage.removeItem("token");
};

export const getIsAdmin = (): boolean | null => {
  const token = getToken();

  if (token) {
    const decoded = JSON.parse(atob(token));
    return decoded.isAdmin;
  }

  return null;
};
