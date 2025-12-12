/**
 * Migration script to transfer cart data from localStorage to cookies
 * This should be called once when the app loads to migrate existing users' carts
 */

import Cookies from "js-cookie";

export function migrateCartFromLocalStorage(): void {
  // Check if we're in the browser
  if (typeof window === "undefined") return;

  try {
    // Check if migration has already been done
    const migrationDone = localStorage.getItem("cart-migrated");
    if (migrationDone === "true") {
      return;
    }

    // Get cart from localStorage
    const localStorageCart = localStorage.getItem("cart");

    // If no cart in localStorage, mark migration as done
    if (!localStorageCart) {
      localStorage.setItem("cart-migrated", "true");
      return;
    }

    // Check if there's already a cart in cookies
    const cookieCart = Cookies.get("cart");

    // If there's no cookie cart, migrate from localStorage
    if (!cookieCart) {
      try {
        // Validate that the localStorage cart is valid JSON
        const parsedCart = JSON.parse(localStorageCart);

        // Save to cookies
        Cookies.set("cart", JSON.stringify(parsedCart), {
          expires: 7, // 7 jours
          path: "/",
          sameSite: "lax",
        });

        console.log(
          `✅ Cart migrated successfully: ${parsedCart.length} items transferred from localStorage to cookies`
        );
      } catch (error) {
        console.error(
          "❌ Error parsing localStorage cart during migration:",
          error
        );
      }
    } else {
      console.log(
        "ℹ️ Cart already exists in cookies, skipping migration from localStorage"
      );
    }

    // Clean up: remove old localStorage cart and mark migration as done
    localStorage.removeItem("cart");
    localStorage.setItem("cart-migrated", "true");
  } catch (error) {
    console.error("❌ Error during cart migration:", error);
    // Even if migration fails, mark it as done to avoid infinite loops
    localStorage.setItem("cart-migrated", "true");
  }
}
