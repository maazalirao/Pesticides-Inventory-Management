// userApi.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const createUserFromClerk = async (userData, token) => {
  try {
    // Extract the primary email address
    const primaryEmail = userData.emailAddresses?.find(
      (email) => email.id === userData.primaryEmailAddressId
    )?.emailAddress;

    if (!primaryEmail) {
      throw new Error("No primary email found");
    }

    const response = await api.post(
      "/users/clerk",
      {
        clerkId: userData.id,
        email: primaryEmail,
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Error creating user:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export default api;

// You can keep your other user-related functions here (e.g. profile, wishlist, etc.)
