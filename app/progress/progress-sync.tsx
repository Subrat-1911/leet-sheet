"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

type Props = {
  username: string;
};

export default function ProgressSync({
  username,
}: Props) {
  const router = useRouter();

  const syncingRef = useRef(false);
  const lastSyncRef = useRef(0);

  const syncProgress = useCallback(
    async (force = false) => {
      if (!username || syncingRef.current) {
        return;
      }

      const now = Date.now();

      // Prevent duplicate syncs happening too close together.
      if (
        !force &&
        now - lastSyncRef.current < 3000
      ) {
        return;
      }

      syncingRef.current = true;
      lastSyncRef.current = now;

      try {
        const response = await fetch(
          "/api/progress/sync",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              username,
            }),
            cache: "no-store",
          }
        );

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        console.log(
          "Progress sync:",
          data
        );

        if (data.newlySolved > 0) {
          router.refresh();
        }
      } catch (error) {
        console.error(
          "Progress sync failed:",
          error
        );
      } finally {
        syncingRef.current = false;
      }
    },
    [username, router]
  );

  useEffect(() => {
    // Sync when tracker page first opens.
    syncProgress();

    const handleVisibilityChange = () => {
      if (
        document.visibilityState ===
        "visible"
      ) {
        /*
         * User may have just returned from
         * LeetCode. Give LeetCode a moment
         * to register the Accepted submission.
         */
        setTimeout(() => {
          syncProgress(true);
        }, 1000);
      }
    };

    const handleFocus = () => {
      setTimeout(() => {
        syncProgress(true);
      }, 1000);
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    window.addEventListener(
      "focus",
      handleFocus
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );

      window.removeEventListener(
        "focus",
        handleFocus
      );
    };
  }, [syncProgress]);

  return null;
}