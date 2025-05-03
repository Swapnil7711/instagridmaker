"use client";

import { useState, useEffect } from "react";

function useLocalStorageState<T>(
  key: string,
  defaultValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  // Initialize state *always* with defaultValue for hydration compatibility
  const [state, setState] = useState<T>(defaultValue);

  // Effect to read from localStorage *after* mount on the client
  useEffect(() => {
    // Check if window is defined (runs only on client-side)
    if (typeof window === "undefined") {
      return;
    }
    try {
      const storedValue = window.localStorage.getItem(key);
      if (storedValue !== null) {
        // If a value is found, update the state
        setState(JSON.parse(storedValue));
      }
      // No else needed, state is already defaultValue if nothing found
    } catch (error) {
      console.error(`Error reading localStorage key “${key}” on mount:`, error);
      // Keep defaultValue if error occurs
    }
    // Run only once after initial hydration/mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]); // Depend on key in case it changes (though unlikely for this hook pattern)

  useEffect(() => {
    // Check if window is defined
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(key, JSON.stringify(state));
      } catch (error) {
        console.error(`Error setting localStorage key “${key}”:`, error);
      }
    }
  }, [key, state]);

  // Important: Need to handle image object URLs on rehydration
  // Object URLs created with URL.createObjectURL are temporary and won't persist across sessions.
  // For MVP, we accept that images need re-uploading on page reload.
  // A more robust solution would involve storing image data (e.g., base64) or using IndexedDB,
  // but that's beyond the MVP scope.
  useEffect(() => {
    // Clear potentially invalid blob URLs from previous sessions on initial load
    // This doesn't perfectly solve the issue but prevents trying to use dead URLs.
    if (typeof window !== "undefined") {
      const storedValue = window.localStorage.getItem(key);
      if (storedValue) {
        try {
          const parsedState = JSON.parse(storedValue);
          // If state is an array (like our images state), check if it looks like image items
          // This is a basic check; adapt if your state structure is different
          if (
            Array.isArray(parsedState) &&
            parsedState.length > 0 &&
            parsedState[0]?.src?.startsWith("blob:")
          ) {
            console.warn(
              "Image state loaded from localStorage, but Blob URLs are temporary. Please re-upload images if they don't display."
            );
            // For MVP, we don't attempt to revive blobs. We could potentially clear them here
            // if they consistently fail, e.g., setState([]);
          }
        } catch (error) {
          // Ignore parsing errors, default state will be used
        }
      }
    }
    // Run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return [state, setState];
}

export default useLocalStorageState;
