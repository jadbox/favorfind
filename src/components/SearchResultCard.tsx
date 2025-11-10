import React, { useState, useEffect } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import type { SearchResult } from "../types";
import { toggleSaveToLibrary } from "../utils/localStorage";
import Markdown from 'react-markdown'

interface SearchResultCardProps {
  result: SearchResult;
  isSaved: boolean;
  returnTo?: string;
}

const SearchResultCard: React.FC<SearchResultCardProps> = ({
  result,
  isSaved: initialIsSaved,
  returnTo,
}) => {
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Update local state when prop changes
  React.useEffect(() => {
    setIsSaved(initialIsSaved);
  }, [initialIsSaved]);

  const handleSaveToggle = async () => {
    if (isLoading) return;

    setIsLoading(true);
    const newSavedState = !isSaved;

    try {
      // Save/remove using localStorage
      toggleSaveToLibrary(result);

      // Update local UI state immediately
      setIsSaved(newSavedState);

      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent("library-updated"));

      // Show toast notification
      showToast(
        newSavedState
          ? "Article saved to library!"
          : "Article removed from library",
        "success"
      );

      // Optional: Still call the API stub for future database integration
      // This doesn't affect the UI but prepares for when we add a database
      try {
        const formData = new FormData();
        formData.append("action", newSavedState ? "save" : "remove");
        formData.append("id", result.id);
        formData.append("title", result.title);
        formData.append("source", result.source);
        formData.append("publisher", result.publisher);
        formData.append("publicationDate", result.publicationDate);
        formData.append("abstract", result.abstract);
        formData.append("url", result.url);
        formData.append("category", result.category);

        await fetch("/api/library/toggle", {
          method: "POST",
          headers: {
            Accept: "application/json",
          },
          credentials: "same-origin",
          body: formData,
        });
        // We don't wait for or check the response since localStorage is the source of truth
      } catch (apiError) {
        console.log("API stub call failed (expected):", apiError);
      }
    } catch (error) {
      // Revert the state if localStorage failed
      showToast("Failed to save article. Please try again.", "error");
      console.error("Error toggling save status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    // Remove existing toasts
    const existingToasts = document.querySelectorAll(".toast-notification");
    existingToasts.forEach((toast) => toast.remove());

    // Create new toast
    const toast = document.createElement("div");
    toast.className = `toast-notification fixed bottom-4 right-4 z-50 px-4 py-2 rounded-md shadow-lg text-white text-sm font-medium ${
      type === "success" ? "bg-green-500" : "bg-red-500"
    }`;
    toast.textContent = message;

    document.body.appendChild(toast);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, 3000);
  };

  const formatDate = (dateString: string) => {
    // return new Date(dateString).toLocaleDateString("en-US", {
    //   year: "numeric",
    //   month: "short",
    //   day: "numeric",
    // });
    return dateString;
  };

  const extractDomain = (url: string) => {
    try {
      const domain = new URL(url).hostname;

      // if domain contains PUBMED, return PubMed
      if (
        domain.toLowerCase().includes("pubmed") ||
        domain.toLowerCase().includes("ncbi")
      ) {
        return "PubMed";
      }
      // Remove 'www.' prefix if present
      return domain.replace(/^www\./, "");
    } catch {
      return "Unknown";
    }
  };

  return (
    <div className="card max-w-6xl border shadow-sm">
      <div className="card-body p-6">
        <h3 className="card-title text-lg font-semibold mb-2 leading-tight">
          <a href={result.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
            {result.title}
          </a>
        </h3>

        {/* Source and Date */}
        {/*<div className="flex items-center space-x-4 mb-3 text-sm text-text-secondary">
          <span className="font-medium">
            {extractDomain(result.url)}
            <span className="grayscale text-gray-400 ml-1">
              ({result.source})
            </span>
          </span>
          <span>•</span>
          <span>{formatDate(result.publicationDate)}</span>
        </div>*/}

        {/* Abstract */}
        <div className="text-text-secondary text-sm leading-relaxed mb-4">
          {/* {isMounted ? <Markdown>{result.abstract}</Markdown> : result.abstract} */}
          {result.abstract}
        </div>

        {/* Actions */}
        <div className="card-actions justify-end items-center space-x-4">
          <a
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-text-secondary hover:text-primary transition-colors"
          >
            Open in New Window
          </a>
          <button
            onClick={handleSaveToggle}
            disabled={isLoading}
            className={`btn btn-sm rounded-md transition-all ${
              isSaved
                ? "bg-primary border border-primary text-white hover:bg-primary hover:bg-opacity-90"
                : "bg-base-300 text-text-primary border border-border-subtle hover:bg-base-250"
            } ${isLoading ? "cursor-not-allowed opacity-50" : ""}`}
            aria-label={isSaved ? "Remove from Library" : "Save to Library"}
          >
            <div className="flex items-center space-x-2">
              <span>
                {isLoading
                  ? "Saving..."
                  : isSaved
                  ? "Saved"
                  : "Save to Library"}
              </span>
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              ) : isSaved ? (
                <BookmarkCheck className="h-4 w-4" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchResultCard;
