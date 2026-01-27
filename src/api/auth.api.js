import client from "./client";

export const authAPI = {
  login: (email, password) =>
    client.post("/auth/login", { email, password }),

  register: (name, email, password) =>
    client.post("/auth/register", { name, email, password }),

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    window.location.href = "/auth";
  },

  refresh: (refreshToken) =>
    client.post("/auth/refresh", { refreshToken }),
};
export const isLoggedIn = () => {
  return !!localStorage.getItem("token");
};
