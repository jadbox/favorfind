import React, { useState } from "react";

const DISCLAIMER_STORAGE_KEY = "favorfind-disclaimer-accepted";

const DisclaimerModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(DISCLAIMER_STORAGE_KEY) !== "true";
  });

  const handleAccept = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(DISCLAIMER_STORAGE_KEY, "true");
    }
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
    >
      <div className="w-full max-w-xl rounded-2xl bg-white p-8 shadow-2xl">
        <h2 className="text-2xl font-semibold text-gray-900">Disclaimer</h2>
        <div className="mt-4 space-y-3 text-sm text-gray-600">
          <p>
            FavorFind provides research tools and article summaries for
            informational purposes only. We do not offer medical advice, and all
            content on this platform should be independently verified with a
            licensed healthcare professional.
          </p>
          <p>
            By continuing, you agree that FavorFind and its partners are not
            liable for any decisions or actions taken based on information
            obtained through this site. Never disregard professional medical
            guidance or delay seeking care because of materials you find here.
          </p>
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <a
            href="/terms"
            target="_blank"
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-400 hover:text-gray-900"
          >
            View Terms
          </a>
          <button
            type="button"
            onClick={handleAccept}
            className="inline-flex items-center justify-center rounded-lg bg-medical-600 px-5 py-2 text-sm font-semibold text-white shadow transition hover:bg-medical-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-medical-600"
          >
            I Understand and Agree
          </button>
        </div>
      </div>
    </div>
  );
};

export default DisclaimerModal;
