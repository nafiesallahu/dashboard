import { useCallback, useLayoutEffect, useRef, useState } from 'react';

type Size = { width: number; height: number };


export function useElementSize<T extends HTMLElement>(): { ref: (el: T | null) => void; width: number; height: number } {
  const [node, setNode] = useState<T | null>(null);
  const rafId = useRef<number | null>(null);
  const last = useRef<Size>({ width: 0, height: 0 });
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });

  const ref = useCallback((el: T | null) => {
    setNode(el);
  }, []);

  useLayoutEffect(() => {
    if (!node) return;

    const measure = () => {
      const nextW = Math.round(node.clientWidth);
      const nextH = Math.round(node.clientHeight);
      if (nextW === last.current.width && nextH === last.current.height) return;
      last.current = { width: nextW, height: nextH };
      setSize(last.current);
    };

    measure();

    const onResize = () => {
      if (rafId.current != null) return;
      rafId.current = requestAnimationFrame(() => {
        rafId.current = null;
        measure();
      });
    };

    const ro = new ResizeObserver(onResize);
    ro.observe(node);

    return () => {
      ro.disconnect();
      if (rafId.current != null) cancelAnimationFrame(rafId.current);
      rafId.current = null;
    };
  }, [node]);

  return { ref, width: size.width, height: size.height };
}


