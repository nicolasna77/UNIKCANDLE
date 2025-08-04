import { authClient } from "@/lib/auth-client";

export const oneTapCall = async () => {
  try {
    await authClient.oneTap({
      callbackURL: "/", // redirect '/' route after login
      context: "signin",
    });
  } catch (error) {
    console.log(error);
  }
};
