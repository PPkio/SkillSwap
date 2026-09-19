"use client";

import { useEffect, useState } from "react";
import { getState, setNotifyFn, type AppState } from "@/lib/store";

export function useAppState(): AppState {
  const [state, setState] = useState<AppState>(() => getState());

  useEffect(() => {
    const onChange = () => setState(getState());
    setNotifyFn(onChange);
    return () => {
      setNotifyFn(null);
    };
  }, []);

  return state;
}
