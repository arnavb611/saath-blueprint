import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Enables in-page anchor navigation (/#section) with React Router.
 * Also compensates for the fixed header height.
 */
const ScrollToHash = () => {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;

    const id = location.hash.replace("#", "");
    const el = document.getElementById(id);
    if (!el) return;

    // Wait a tick for layout/content to be ready.
    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      // Offset for fixed header
      window.scrollBy({ top: -96, left: 0, behavior: "instant" as ScrollBehavior });
    });
  }, [location.pathname, location.hash]);

  return null;
};

export default ScrollToHash;
