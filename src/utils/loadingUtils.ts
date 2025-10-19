// Centralized loading state management
const LOADING_SESSION_KEY = "favorfind-loading-active";

const hasSessionStorage =
  typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";

export const LoadingUtils = {
  show() {
    if (hasSessionStorage) {
      sessionStorage.setItem(LOADING_SESSION_KEY, "true");
    }
    const overlay = document.getElementById("loading-overlay");
    if (overlay) {
      overlay.classList.remove("opacity-0", "pointer-events-none");
      overlay.classList.add("opacity-100", "pointer-events-auto");
    }
  },

  hide() {
    if (hasSessionStorage) {
      sessionStorage.removeItem(LOADING_SESSION_KEY);
    }
    const overlay = document.getElementById("loading-overlay");
    if (overlay) {
      overlay.classList.remove("opacity-100", "pointer-events-auto");
      overlay.classList.add("opacity-0", "pointer-events-none");
    }
  },

  // Initialize loading for forms and navigation
  initializeForPage() {
    // Check if loading should be active for this session
    if (
      hasSessionStorage &&
      sessionStorage.getItem(LOADING_SESSION_KEY) !== "true"
    ) {
      this.hide();
    } else if (!hasSessionStorage) {
      this.hide();
    }

    const handleSubmit = () => this.show();
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target?.closest("a") as HTMLAnchorElement;
      if (
        link &&
        link.href &&
        link.target !== "_blank" &&
        !link.href.startsWith("javascript:") &&
        !link.hasAttribute("download")
      ) {
        const url = new URL(link.href, window.location.origin);
        if (url.origin === window.location.origin) {
          this.show();
        }
      }
    };
    const handleLoad = () => this.hide();
    const handleStorage = () => this.hide();

    // Add event listeners
    const forms = document.querySelectorAll('form[action="/search"]');
    forms.forEach((form) => form.addEventListener("submit", handleSubmit));
    document.addEventListener("click", handleClick);
    window.addEventListener("load", handleLoad);
    window.addEventListener("storage", handleStorage);

    // Return a cleanup function to remove listeners
    return () => {
      forms.forEach((form) => form.removeEventListener("submit", handleSubmit));
      document.removeEventListener("click", handleClick);
      window.removeEventListener("load", handleLoad);
      window.removeEventListener("storage", handleStorage);
    };
  },
};
