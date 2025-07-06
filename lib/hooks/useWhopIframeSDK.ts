"use client";

import { useEffect, useRef, useState } from "react";
import { createAppIframeSDK } from "@whop-apps/iframe";

interface WhopIframeSDKState {
  sdk: any | null;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useWhopIframeSDK() {
  const [state, setState] = useState<WhopIframeSDKState>({
    sdk: null,
    isInitialized: false,
    isLoading: true,
    error: null,
  });

  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Only initialize in browser environment
    if (typeof window === "undefined") {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "SDK can only be initialized in browser environment",
      }));
      return;
    }

    let isMounted = true;

    const initializeSDK = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        // Create the iframe SDK - this sets up postMessage listeners
        // The function might require configuration object
        const sdkResponse = await createAppIframeSDK({});

        if (isMounted) {
          setState({
            sdk: sdkResponse,
            isInitialized: true,
            isLoading: false,
            error: null,
          });

          console.log("✅ Whop Iframe SDK initialized successfully");
        }
      } catch (error) {
        if (isMounted) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to initialize Whop Iframe SDK";
          setState({
            sdk: null,
            isInitialized: false,
            isLoading: false,
            error: errorMessage,
          });
          console.error("❌ Failed to initialize Whop Iframe SDK:", error);
        }
      }
    };

    initializeSDK();

    return () => {
      isMounted = false;
      // Manual cleanup if needed
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, []);

  return state;
}

// Hook for common iframe communication patterns
export function useWhopIframeActions() {
  const { sdk, isInitialized, error } = useWhopIframeSDK();

  const sendMessage = async (message: any) => {
    if (!sdk || !isInitialized) {
      throw new Error("Whop Iframe SDK not initialized");
    }

    // Use SDK to send message to parent Whop application
    // The exact method depends on what's available in the SDK
    if (typeof sdk.sendMessage === "function") {
      return await sdk.sendMessage(message);
    }

    throw new Error("sendMessage method not available in SDK");
  };

  const requestData = async (dataType: string) => {
    if (!sdk || !isInitialized) {
      throw new Error("Whop Iframe SDK not initialized");
    }

    // Request data from parent Whop application
    if (typeof sdk.requestData === "function") {
      return await sdk.requestData(dataType);
    }

    throw new Error("requestData method not available in SDK");
  };

  const updateHeight = async (height: number) => {
    if (!sdk || !isInitialized) {
      throw new Error("Whop Iframe SDK not initialized");
    }

    // Update iframe height in parent application
    if (typeof sdk.updateHeight === "function") {
      return await sdk.updateHeight(height);
    }

    throw new Error("updateHeight method not available in SDK");
  };

  const notifyReady = async () => {
    if (!sdk || !isInitialized) {
      throw new Error("Whop Iframe SDK not initialized");
    }

    // Notify parent that iframe is ready
    if (typeof sdk.notifyReady === "function") {
      return await sdk.notifyReady();
    }

    throw new Error("notifyReady method not available in SDK");
  };

  return {
    sendMessage,
    requestData,
    updateHeight,
    notifyReady,
    isReady: isInitialized && !error,
    error,
  };
}

// Hook for accessing the raw SDK instance
export function useWhopIframeSDKInstance() {
  const { sdk, isInitialized, isLoading, error } = useWhopIframeSDK();

  return {
    sdk,
    isInitialized,
    isLoading,
    error,
    isReady: isInitialized && !error,
  };
}
