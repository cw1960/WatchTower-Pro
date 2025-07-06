"use client";

import { useEffect } from "react";
import { useWhopIframeUtils } from "@/lib/utils/iframe-utils";

interface WhopIframeInitializerProps {
  autoResize?: boolean;
  notifyReady?: boolean;
  enableErrorReporting?: boolean;
}

export default function WhopIframeInitializer({
  autoResize = true,
  notifyReady = true,
  enableErrorReporting = true,
}: WhopIframeInitializerProps) {
  const iframeUtils = useWhopIframeUtils();

  useEffect(() => {
    if (!iframeUtils.isReady) {
      return;
    }

    let cleanup: (() => void) | undefined;

    const initializeIframe = async () => {
      try {
        console.log("🔄 Initializing Whop iframe features...");

        // Notify parent that app is ready
        if (notifyReady) {
          await iframeUtils.notifyAppReady();
          console.log("✅ Notified parent that app is ready");
        }

        // Set up auto-resizing
        if (autoResize) {
          cleanup = iframeUtils.autoResizeHeight();
          console.log("✅ Auto-resize enabled");
        }

        // Set up error reporting
        if (enableErrorReporting && typeof window !== "undefined") {
          const handleError = (event: ErrorEvent) => {
            iframeUtils.reportError(
              event.error || event.message,
              "global-error-handler",
            );
          };

          const handleRejection = (event: PromiseRejectionEvent) => {
            iframeUtils.reportError(
              event.reason,
              "unhandled-promise-rejection",
            );
          };

          window.addEventListener("error", handleError);
          window.addEventListener("unhandledrejection", handleRejection);

          // Add to cleanup
          const originalCleanup = cleanup;
          cleanup = () => {
            if (originalCleanup) originalCleanup();
            window.removeEventListener("error", handleError);
            window.removeEventListener("unhandledrejection", handleRejection);
          };

          console.log("✅ Error reporting enabled");
        }

        console.log("🎉 Whop iframe features initialized successfully");
      } catch (error) {
        console.error("❌ Failed to initialize iframe features:", error);
        iframeUtils.reportError(
          error instanceof Error ? error : String(error),
          "iframe-initialization",
        );
      }
    };

    initializeIframe();

    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [iframeUtils.isReady, autoResize, notifyReady, enableErrorReporting]);

  // Display initialization status for debugging
  if (process.env.NODE_ENV === "development") {
    return (
      <div
        style={{
          position: "fixed",
          top: 10,
          right: 10,
          padding: "8px 12px",
          background: iframeUtils.isReady ? "#059669" : "#DC2626",
          color: "white",
          borderRadius: "6px",
          fontSize: "12px",
          fontFamily: "monospace",
          zIndex: 9999,
          opacity: 0.8,
        }}
      >
        Iframe SDK: {iframeUtils.isReady ? "Ready" : "Loading..."}
        {iframeUtils.error && (
          <div style={{ fontSize: "10px", marginTop: "4px" }}>
            Error: {iframeUtils.error}
          </div>
        )}
      </div>
    );
  }

  return null;
}
