import { useEffect, useRef } from "react";

export function useWillUnmount(fn: () => void): void {
  const fnRef = useRef(fn);

  fnRef.current = fn;

  useEffect(() => {
    return () => fnRef.current();
  }, []);
}
