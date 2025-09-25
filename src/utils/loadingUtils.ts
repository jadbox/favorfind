// Centralized loading state management
export const LoadingUtils = {
  show() {
    const overlay = document.getElementById("loading-overlay");
    if (overlay) {
      overlay.classList.remove("opacity-0", "pointer-events-none");
      overlay.classList.add("opacity-100", "pointer-events-auto");
    }
  },

  hide() {
    const overlay = document.getElementById("loading-overlay");
    if (overlay) {
      overlay.classList.remove("opacity-100", "pointer-events-auto");
      overlay.classList.add("opacity-0", "pointer-events-none");
    }
  },

  // Initialize loading for forms and navigation
  initializeForPage() {
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
        !link.href.startsWith("javascript:") &&
        !link.hasAttribute("download")
      ) {
        const url = new URL(link.href, window.location.origin);
        if (url.origin === window.location.origin) {
          this.show();
        }
      }
    });

    // Hide loading when page is fully loaded
    window.addEventListener("load", () => {
      this.hide();
    });
  },
};
