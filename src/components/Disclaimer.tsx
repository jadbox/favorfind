import React from "react";

const Disclaimer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 px-6 py-4 mt-8 w-full">
      <div className="max-w-7xl mx-auto text-sm text-gray-500 w-full text-center">
        <p>
          For informational purposes only — not a substitute for professional
          medical advice.
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400 justify-center">
          <a className="hover:text-gray-600" href="/terms" target="_blank">
            Terms of Service
          </a>
          <span aria-hidden="true">•</span>
          <a className="hover:text-gray-600" href="/privacy" target="_blank">
            Privacy Policy
          </a>
          {/* <span className="hidden md:inline" aria-hidden="true">
            •
          </span>
          <a
            className="hidden md:inline hover:text-gray-600"
            href="/api/del_cache"
          >
            Debug: Delete Cache
          </a> */}
        </div>
      </div>
    </footer>
  );
};

export default Disclaimer;
