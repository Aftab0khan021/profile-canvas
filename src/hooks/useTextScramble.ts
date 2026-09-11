import { useCallback, useRef } from 'react';

// Characters used for scrambling — safe printable ASCII only
const CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

/**
 * Returns a scramble function that animates target text from random chars
 * to the real text, character by character.
 *
 * Security: Only reads/writes textContent — no innerHTML, no eval.
 * Cleanup: Clears the interval on every new call and on unmount via returned cancel fn.
 */
export function useTextScramble() {
  const frameRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scramble = useCallback((el: HTMLElement | null, finalText: string, duration = 800) => {
    if (!el) return () => {};
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.textContent = finalText;
      return () => {};
    }

    if (frameRef.current) clearInterval(frameRef.current);

    const totalFrames = Math.floor(duration / 40);
    let frame = 0;

    frameRef.current = setInterval(() => {
      const progress = frame / totalFrames;
      const resolvedCount = Math.floor(progress * finalText.length);

      el.textContent = finalText
        .split('')
        .map((char, i) => {
          if (char === ' ') return ' ';
          if (i < resolvedCount) return char;
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        })
        .join('');

      frame++;
      if (frame > totalFrames) {
        el.textContent = finalText;
        if (frameRef.current) clearInterval(frameRef.current);
      }
    }, 40);

    return () => {
      if (frameRef.current) clearInterval(frameRef.current);
    };
  }, []);

  return { scramble };
}
