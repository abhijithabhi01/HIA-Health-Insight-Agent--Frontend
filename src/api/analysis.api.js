import client from "./client";

export const analysisAPI = {
  analyzeReport: (reportText) =>
    client.post("/analysis/report", { reportText }),
};
