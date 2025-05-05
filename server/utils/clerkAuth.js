import User from "../models/userModel.js";

/**
 * Helper function to get or create a user from Clerk data
 * @param {Object} clerkUser - The Clerk user object
 * @returns {Promise<Object>} The user object
 */
export const getOrCreateUserFromClerk = async (clerkUser) => {
  try {
    // Find existing user by clerkId
    let user = await User.findOne({ clerkId: clerkUser.id });

    if (!user) {
      // Create new user if not found
      user = await User.create({
        clerkId: clerkUser.id,
        email: clerkUser.emailAddresses[0].emailAddress,
        firstName: clerkUser.firstName || "",
        lastName: clerkUser.lastName || "",
        role: "customer", // Default role
      });
    }

    return user;
  } catch (error) {
    console.error("Error in getOrCreateUserFromClerk:", error);
    throw error;
  }
};

/**
 * Helper function to verify Clerk session
 * @param {Object} req - Express request object
 * @returns {Promise<Object>} The user object
 */
export const verifyClerkSession = async (req) => {
  const clerkId = req.headers["x-clerk-id"];

  if (!clerkId) {
    throw new Error("No Clerk ID provided");
  }

  const user = await User.findOne({ clerkId }).select("-password");

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};
