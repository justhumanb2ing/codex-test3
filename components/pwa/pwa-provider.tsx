"use client";

import { useEffect } from "react";

export const PwaProvider = () => {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });

        if (registration?.update) {
          registration.update();
        }
      } catch (error) {
        console.error("Service worker registration failed", error);
      }
    };

    register();

    return () => {
      // no-op cleanup
    };
  }, []);

  return null;
};
