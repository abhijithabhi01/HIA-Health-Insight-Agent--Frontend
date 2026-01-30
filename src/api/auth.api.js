import client from "./client";

export const authAPI = {
  login: (email, password) =>
    client.post("/auth/login", { email, password }),

  register: (name, email, password) =>
    client.post("/auth/register", { name, email, password }),

  deleteAccount: () => client.delete("/auth/delete"),

  logout: () => {
    localStorage.removeItem("token");
    window.location.href = "/auth";
  }
};
export const isLoggedIn = () => {
  return !!localStorage.getItem("token");
};
