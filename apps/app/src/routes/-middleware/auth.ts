import { isAuthenticated } from "@/services/api";
import { ParsedLocation, redirect } from "@tanstack/react-router";

export const authMiddleware = async (location: ParsedLocation<{}>) => {
  if (!isAuthenticated()) {
    console.log("🚫 Not authenticated, redirecting to login");
    throw redirect({
      to: "/login",
      search: {
        redirect: location.href,
      },
    });
  }
};
