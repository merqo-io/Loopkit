import { useEffect, useRef, useState } from "react";

// Last stroke starts at 240ms and draws in over 900ms (globals.css'
// `.scratch-draw-in`) — 1150ms comfortably covers every stroke finishing.
const AUTO_SCRATCH_MS = 1150;

export function useScratchAutoReveal({
  autoManaged,
  revealed,
  reducedMotion,
}: {
  autoManaged: boolean;
  revealed: boolean;
  reducedMotion: boolean;
}) {
  const playedRef = useRef(false);
  const [autoRevealed, setAutoRevealed] = useState(
    autoManaged && !reducedMotion ? false : revealed,
  );
  const [autoScratching, setAutoScratching] = useState(false);
  // Fires the same reveal transition the auto-scratch timer below would —
  // shared so the canvas layer's "you actually cleared enough" can commit
  // early instead of duplicating the reveal logic.
  const commitRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!autoManaged) return;
    if (!revealed) {
      playedRef.current = false;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncs to external input, not derivable from render state
      setAutoRevealed(false);
      setAutoScratching(false);
      return;
    }
    if (playedRef.current) return;
    playedRef.current = true;
    if (reducedMotion) {
      setAutoRevealed(true);
      return;
    }
    setAutoScratching(true);
    const commit = () => {
      setAutoScratching(false);
      setAutoRevealed(true);
    };
    commitRef.current = commit;
    const timer = setTimeout(commit, AUTO_SCRATCH_MS);
    return () => {
      clearTimeout(timer);
      playedRef.current = false;
      commitRef.current = null;
    };
  }, [autoManaged, revealed, reducedMotion]);

  return { autoRevealed, autoScratching, commitRef };
}
