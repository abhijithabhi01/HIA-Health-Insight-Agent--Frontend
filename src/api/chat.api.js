import client from "./client";

export const chatAPI = {
  // Create new chat
  createChat: (title) => client.post("/chats", { title }),

  // Send message
  sendMessage: (chatId, message) =>
    client.post(`/chats/${chatId}/messages`, { message }),

  // Get all chats
  getAllChats: () => client.get("/chats"),

  // Get specific chat by ID
  getChatById: (chatId) => client.get(`/chats/${chatId}`),

  // Update chat (rename)
  updateChat: (chatId, data) => client.put(`/chats/${chatId}`, data),

  // Search chats
  searchChats: (query) => client.get(`/chats/search?q=${encodeURIComponent(query)}`),

  // Delete chat
  deleteChat: (chatId) => client.delete(`/chats/${chatId}`),
};
