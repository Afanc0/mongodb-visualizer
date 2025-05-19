import { useEffect, useState, useRef, Dispatch, SetStateAction } from "react";
import { invoke } from "@tauri-apps/api/core";

const DEFAULT_POLL_INTERVAL = 10000; // 10 seconds is a reasonable balance

interface UseMongoConnectionOptions {
  pollInterval?: number;  // Optional: custom poll interval
}

export const useMongoConnection = (
  options: UseMongoConnectionOptions = {}
): [boolean, Dispatch<SetStateAction<boolean>>] =>  {
  const [isServiceRunning, setIsServiceRunning] = useState<boolean>(false);
  const pollInterval = options.pollInterval ?? DEFAULT_POLL_INTERVAL;
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    const checkConnection = async () => {
      try {
        const connected = await invoke<boolean>("connect_mongo_service");
        if (isMountedRef.current) {
          setIsServiceRunning(connected);
        }
      } catch (e) {
        if (isMountedRef.current) {
          setIsServiceRunning(false);
        }
        console.error("MongoDB check failed:", e);
      }
    };

    checkConnection(); // initial call
    const intervalId = setInterval(checkConnection, pollInterval);

    return () => {
      isMountedRef.current = false;
      clearInterval(intervalId);
    };
  }, [pollInterval]);

  return [isServiceRunning, setIsServiceRunning];
};
