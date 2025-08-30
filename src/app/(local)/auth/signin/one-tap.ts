import { authClient } from "@/lib/auth-client";

let oneTapPromise: Promise<void> | null = null;

export const oneTapCall = async () => {
  // Éviter les appels multiples simultanés
  if (oneTapPromise) {
    return oneTapPromise;
  }

  oneTapPromise = (async () => {
    try {
      await authClient.oneTap({
        callbackURL: "/",
        onPromptNotification: (notification) => {
          console.warn("One Tap prompt was dismissed. Consider showing alternative sign-in options.", notification);
        }
      });
    } catch (error) {
      if (error instanceof Error && !error.message.includes('AbortError')) {
        console.error("One Tap error:", error);
      }
    } finally {
      // Réinitialiser après un délai pour permettre de futurs appels
      setTimeout(() => {
        oneTapPromise = null;
      }, 5000);
    }
  })();

  return oneTapPromise;
};
