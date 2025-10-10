// Centralized loading state management
const LOADING_SESSION_KEY = "medeligo-loading-active";

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

    // Show loading for form submissions
    const forms = document.querySelectorAll('form[action="/search"]');
    forms.forEach((form) => {
      form.addEventListener("submit", () => {
        this.show();
      });
    });

    // Show loading for internal navigation links
    document.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      const link = target?.closest("a") as HTMLAnchorElement;
      if (
        link &&
        link.href &&
        link.target !== "_blank" && // Do not show for new tabs
        !link.href.startsWith("javascript:") &&
        !link.hasAttribute("download")
      ) {
        const url = new URL(link.href, window.location.origin);
        if (url.origin === window.location.origin) {
          this.show();
        }
      }
    });

    // Hide loading when page is fully loaded, and clear session flag
    window.addEventListener("load", () => {
      this.hide();
    });

    // Hide loading on storage event (cross-tab activity)
    window.addEventListener("storage", () => {
      // This event is for cross-tab communication.
      // We just hide the loading indicator, as the primary session tracking
      // should prevent it from showing incorrectly.
      this.hide();
    });
  },
};
