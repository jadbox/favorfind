export const filterConfig = {
  contentType: [
    "All",
    "Article",
    "Book",
    "Video",
    "Course",
    "Guide",
    "Research Paper",
  ],
  sourceType: [
    "All",
    "Academic",
    "News",
    "Blog",
    "Forum",
    "Government",
    "Organization",
  ],
  datePublished: [
    { label: "Any Time", value: "any" },
    { label: "Last 24 hours", value: "day" },
    { label: "Last week", value: "week" },
    { label: "Last month", value: "month" },
    { label: "Last year", value: "year" },
  ],
  sortBy: [
    { label: "Relevance", value: "relevance" },
    { label: "Popularity", value: "popular" },
    { label: "Date", value: "date" },
  ],
};
