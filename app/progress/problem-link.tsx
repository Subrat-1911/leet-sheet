"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  problemId: number;
  username: string;
  title: string;
  leetcodeUrl: string;
  solved: boolean;
};

export default function ProblemLink({
  problemId,
  username,
  title,
  leetcodeUrl,
  solved,
}: Props) {
  const router = useRouter();

  const [checking, setChecking] = useState(false);

  const checkingRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );

  const checkProblem = useCallback(async () => {
    if (solved || checkingRef.current) {
      return;
    }

    checkingRef.current = true;
    setChecking(true);

    try {
      const response = await fetch(
        "/api/progress/check-problem",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            problemId,
          }),
          cache: "no-store",
        }
      );

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      console.log(
        "Problem check result:",
        data
      );

      if (data.solved === true) {
        // Stop checking once solved.
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }

        // Refresh the Server Component.
        router.refresh();
      }
    } catch (error) {
      console.error(
        "Problem check failed:",
        error
      );
    } finally {
      checkingRef.current = false;
      setChecking(false);
    }
  }, [
    problemId,
    username,
    solved,
    router,
  ]);

  function startChecking() {
    if (solved) {
      return;
    }

    // Do NOT check immediately.
    // Give LeetCode/API a little time to register
    // the submission.
    setTimeout(() => {
      checkProblem();
    }, 2000);

    // Check every 5 seconds.
    // This gives the API time to show the new Accepted submission.
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      checkProblem();
    }, 5000);
  }

  useEffect(() => {
    if (solved) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      return;
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // Small delay after coming back from LeetCode.
        setTimeout(() => {
          checkProblem();
        }, 2000);
      }
    };

    const handleFocus = () => {
      setTimeout(() => {
        checkProblem();
      }, 2000);
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
  }, [checkProblem, solved]);

  return (
    <a
      href={leetcodeUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={startChecking}
      className={`font-medium transition ${
        solved
          ? "text-[#315C38] hover:text-[#24472B]"
          : "hover:text-[#8A6D2F]"
      }`}
    >
      {title}

      {checking && !solved && (
        <span className="ml-2 text-[9px] uppercase tracking-[0.12em] text-[#A17E32]">
          checking
        </span>
      )}
    </a>
  );
}