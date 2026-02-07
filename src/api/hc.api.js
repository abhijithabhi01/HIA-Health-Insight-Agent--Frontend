import client from "./client";

export const hcAPI = {
  // Submit HC application
  submitApplication: (formData) => 
    client.post("/hc/apply", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  // Get user's own application status
  getMyApplication: () => client.get("/hc/my-application"),

  // Cancel pending application
  cancelApplication: () => client.delete("/hc/my-application"),
};