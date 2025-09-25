import React, { useState } from "react";
import {
  Bookmark,
  BookmarkCheck,
  Presentation as Citation,
} from "lucide-react";
import type { SearchResult } from "../types";

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

  const handleSaveToggle = async () => {
    if (isLoading) return;

    setIsLoading(true);
    const newSavedState = !isSaved;

    try {
      const formData = new FormData();
      formData.append("action", newSavedState ? "save" : "remove");
      formData.append("id", result.id);
      formData.append("title", result.title);
      formData.append("source", result.source);
      formData.append("publisher", result.publisher);
      formData.append("publicationDate", result.publicationDate);
      formData.append("abstract", result.abstract);
      formData.append("citationCount", result.citationCount.toString());
      formData.append("url", result.url);
      formData.append("type", result.type);
      if (result.category) {
        formData.append("category", result.category);
      }
      if (returnTo) {
        formData.append("returnTo", returnTo);
      }

      const response = await fetch("/api/library/toggle", {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      });

      if (response.ok) {
        setIsSaved(newSavedState);
        // Show toast notification
        showToast(
          newSavedState
            ? "Article saved to library!"
            : "Article removed from library",
          "success"
        );

        // If we're on the library page and removing an article, refresh the page
        // if (!newSavedState && window.location.pathname === "/library") {
        //   setTimeout(() => {
        //     window.location.reload();
        //   }, 1000);
        // }
      } else {
        showToast("Failed to save article. Please try again.", "error");
      }
    } catch (error) {
      showToast(
        "Network error. Please check your connection and try again.",
        "error"
      );
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
    toast.className = `toast-notification fixed top-4 right-4 z-50 px-4 py-2 rounded-md shadow-lg text-white text-sm font-medium ${
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
  const getTypeColor = (type: string) => {
    switch (type) {
      case "article":
        return "badge-primary";
      case "trial":
        return "badge-secondary";
      case "guideline":
        return "badge-accent";
      default:
        return "badge-neutral";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
    <div className="card bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="card-body p-6">
        {/* Header with badges */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className={`badge badge-sm ${getTypeColor(result.type)}`}>
              {result.type.charAt(0).toUpperCase() + result.type.slice(1)}
            </span>
            {result.category && (
              <span className="badge badge-outline badge-sm">
                {result.category}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-1 text-sm text-gray-500">
            <Citation className="h-4 w-4" />
            <span>{result.citationCount}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="card-title text-lg font-semibold text-gray-900 mb-2 leading-tight">
          {result.title}
        </h3>

        {/* Source and Date */}
        <div className="flex items-center space-x-4 mb-3 text-sm text-gray-600">
          <span className="font-medium">{result.source}</span>
          <span>•</span>
          <span>{formatDate(result.publicationDate)}</span>
          <span>•</span>
          <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md font-medium">
            {extractDomain(result.url)}
          </span>
        </div>

        {/* Abstract */}
        <p className="text-gray-700 text-sm leading-relaxed mb-4 line-clamp-3">
          {result.abstract}
        </p>

        {/* Actions */}
        <div className="card-actions justify-end items-center space-x-4">
          <a
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Open in New Window
          </a>
          <button
            onClick={handleSaveToggle}
            disabled={isLoading}
            className={`btn btn-sm rounded-md ${
              isSaved
                ? "border border-teal-600 bg-white text-teal-600 hover:bg-teal-50"
                : "bg-teal-100 text-teal-800 hover:bg-teal-200"
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
