import client from "./client";

export const analysisAPI = {
  // Analyze text report
  analyzeReport: (reportText) =>
    client.post("/analysis/report", { reportText }),

  // Upload and analyze image/PDF with optional chatId
  uploadAndAnalyze: (file, chatId = null) => {
    const formData = new FormData();
    formData.append("file", file);
    if (chatId) {
      formData.append("chatId", chatId);
    }

    return client.post("/analysis/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Hybrid: Upload file with additional text notes
  analyzeHybrid: (file, reportText, chatId = null) => {
    const formData = new FormData();
    formData.append("file", file);
    if (reportText) {
      formData.append("reportText", reportText);
    }
    if (chatId) {
      formData.append("chatId", chatId);
    }

    return client.post("/analysis/hybrid", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};