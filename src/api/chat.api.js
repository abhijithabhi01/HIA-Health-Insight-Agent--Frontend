import client from "./client";

export const chatAPI = {
  // Create new chat
  createChat: (title) => client.post("/chat/chats", { title }),

  // Send message
  sendMessage: (chatId, message) =>
    client.post(`/chat/chats/${chatId}/messages`, { message }),

  // Get all chats
  getAllChats: () => client.get("/chat/chats"),

  // Get specific chat by ID
  getChatById: (chatId) => client.get(`/chat/chats/${chatId}`),

  // Update chat (rename)
  updateChat: (chatId, data) => client.put(`/chat/chats/${chatId}`, data),

  // Search chats
  searchChats: (query) => client.get(`/chat/chats/search?q=${encodeURIComponent(query)}`),

  // Delete chat
  deleteChat: (chatId) => client.delete(`/chat/chats/${chatId}`),
  
  // Rename chat
  renameChat: (chatId, title) =>
    client.put(`/chat/chats/${chatId}/rename`, { title }),
};