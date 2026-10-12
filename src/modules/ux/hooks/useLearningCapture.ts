import { useEffect, useRef, type RefObject } from 'react';
import { ActiveLearningCapture } from '../../data/services/learningCapture';

export function useLearningCapture(initial?: { activeSeconds?: number; scope?: RefObject<HTMLElement | null> }) {
  const captureRef = useRef(new ActiveLearningCapture(initial));
  const scope = initial?.scope;
  useEffect(() => {
    const capture = captureRef.current;
    const area = scope?.current;
    let activeArea = !area;
    let withinViewport = true;
    const visible = () => activeArea && withinViewport && document.visibilityState === 'visible' && document.hasFocus();
    const interact = (event: Event) => {
      const inside = !area || (event.target instanceof Node && area.contains(event.target));
      activeArea = inside;
      if (inside) capture.interact();
      capture.setVisible(visible());
    };
    const visibility = () => capture.setVisible(visible());
    const blur = () => capture.setVisible(false);
    capture.start(visible());
    const timer = window.setInterval(() => capture.tick(), 1000);
    document.addEventListener('visibilitychange', visibility);
    const events = ['pointerdown', 'keydown', 'input', 'focusin', 'click', 'wheel'];
    for (const event of events) document.addEventListener(event, interact, { passive: true });
    const observer = area && typeof IntersectionObserver !== 'undefined' ? new IntersectionObserver(entries => {
      withinViewport = entries.some(entry => entry.isIntersecting);
      capture.setVisible(visible());
    }) : null;
    if (area) observer?.observe(area);
    window.addEventListener('focus', visibility);
    window.addEventListener('blur', blur);
    return () => {
      capture.stop();
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', visibility);
      for (const event of events) document.removeEventListener(event, interact);
      observer?.disconnect();
      window.removeEventListener('focus', visibility);
      window.removeEventListener('blur', blur);
    };
  }, [scope]);
  return captureRef;
}
