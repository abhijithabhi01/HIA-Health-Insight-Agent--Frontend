import client from "./client";

export const analysisAPI = {
  // Analyze text report
  analyzeReport: (reportText) =>
    client.post("/analysis/report", { reportText }),

  // Upload and analyze image/PDF
  uploadAndAnalyze: (file) => {
    const formData = new FormData();
    formData.append("file", file);

    return client.post("/analysis/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Hybrid: Upload file with additional text notes
  analyzeHybrid: (file, reportText) => {
    const formData = new FormData();
    formData.append("file", file);
    if (reportText) {
      formData.append("reportText", reportText);
    }

    return client.post("/analysis/hybrid", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};