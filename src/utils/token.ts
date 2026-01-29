export const setToken = (token: string): void => {
  sessionStorage.setItem("token", token);
};

export const getToken = (): string | null => {
  return sessionStorage.getItem("token");
};

export const deleteToken = (): void => {
  sessionStorage.removeItem("token");
};
