import React from "react";
import { ExternalLink, BookOpen, Presentation as Citation } from "lucide-react";
import { SearchResult } from "../types";

interface SearchResultCardProps {
  result: SearchResult;
  isSaved: boolean;
  onToggleSave: (result: SearchResult) => void;
}

const SearchResultCard: React.FC<SearchResultCardProps> = ({
  result,
  isSaved,
  onToggleSave,
}) => {
  const handleOpenExternal = () => {
    window.open(result.url, "_blank", "noopener,noreferrer");
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
        <div className="card-actions justify-end space-x-2">
          <button
            onClick={() => onToggleSave(result)}
            className="btn btn-outline btn-sm flex items-center space-x-1"
          >
            <BookOpen className="h-4 w-4" />
            <span>{isSaved ? "Unsave" : "Save to Library"}</span>
          </button>
          <button
            onClick={handleOpenExternal}
            className="btn btn-primary btn-sm flex items-center space-x-1"
          >
            <ExternalLink className="h-4 w-4" />
            <span>Open Article</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchResultCard;
