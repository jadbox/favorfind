import React from "react";
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
  isSaved,
  returnTo,
}) => {
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
          <form action="/library/toggle" method="GET">
            <input type="hidden" name="id" value={result.id} />
            <input type="hidden" name="title" value={result.title} />
            <input type="hidden" name="source" value={result.source} />
            <input type="hidden" name="publisher" value={result.publisher} />
            <input
              type="hidden"
              name="publicationDate"
              value={result.publicationDate}
            />
            <input type="hidden" name="abstract" value={result.abstract} />
            <input
              type="hidden"
              name="citationCount"
              value={result.citationCount}
            />
            <input type="hidden" name="url" value={result.url} />
            <input type="hidden" name="type" value={result.type} />
            {result.category && (
              <input type="hidden" name="category" value={result.category} />
            )}
            {returnTo && (
              <input type="hidden" name="returnTo" value={returnTo} />
            )}
            <input
              type="hidden"
              name="action"
              value={isSaved ? "remove" : "save"}
            />
            <button
              type="submit"
              className={`btn btn-sm rounded-md ${
                isSaved
                  ? "border border-teal-600 bg-white text-teal-600 hover:bg-teal-50"
                  : "bg-teal-100 text-teal-800 hover:bg-teal-200"
              }`}
              aria-label={isSaved ? "Remove from Library" : "Save to Library"}
            >
              <div className="flex items-center space-x-2">
                <span>{isSaved ? "Saved" : "Save to Library"}</span>
                {isSaved ? (
                  <BookmarkCheck className="h-4 w-4" />
                ) : (
                  <Bookmark className="h-4 w-4" />
                )}
              </div>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SearchResultCard;
