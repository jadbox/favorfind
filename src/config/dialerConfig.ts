import {
  ShoppingCart,
  BookOpen,
  Map,
  Users,
  Newspaper,
  Search,
  type LucideIcon,
} from "lucide-react";

export interface MenuItem {
  label: string;
  icon: LucideIcon;
  value: string;
}

export interface DialerConfig {
  [key: string]: MenuItem[];
}

export const dialerConfig: { topLevel: MenuItem[]; secondLevel: DialerConfig } =
  {
    topLevel: [
      { label: "Buy", icon: ShoppingCart, value: "buy" },
      { label: "Learn", icon: BookOpen, value: "learn" },
      { label: "Guide", icon: Map, value: "guide" },
      { label: "Social", icon: Users, value: "social" },
      { label: "News", icon: Newspaper, value: "news" },
      { label: "Lookup & Forecast", icon: Search, value: "lookup" },
    ],
    secondLevel: {
      buy: [
        { label: "Devices", icon: ShoppingCart, value: "devices" },
        { label: "Supplements", icon: ShoppingCart, value: "supplements" },
        { label: "Services", icon: ShoppingCart, value: "services" },
        { label: "Books", icon: ShoppingCart, value: "books" },
        { label: "Software", icon: ShoppingCart, value: "software" },
      ],
      learn: [
        { label: "Courses", icon: BookOpen, value: "courses" },
        { label: "Articles", icon: BookOpen, value: "articles" },
        { label: "Videos", icon: BookOpen, value: "videos" },
        { label: "Tutors", icon: BookOpen, value: "tutors" },
        { label: "Studies", icon: BookOpen, value: "studies" },
      ],
      guide: [
        { label: "Treatment", icon: Map, value: "treatment" },
        { label: "Prevention", icon: Map, value: "prevention" },
        { label: "Diagnosis", icon: Map, value: "diagnosis" },
        { label: "Nutrition", icon: Map, value: "nutrition" },
        { label: "Fitness", icon: Map, value: "fitness" },
      ],
      social: [
        { label: "Forums", icon: Users, value: "forums" },
        { label: "Groups", icon: Users, value: "groups" },
        { label: "Events", icon: Users, value: "events" },
        { label: "Experts", icon: Users, value: "experts" },
        { label: "Mentors", icon: Users, value: "mentors" },
      ],
      news: [
        { label: "Latest", icon: Newspaper, value: "latest" },
        { label: "Breakthroughs", icon: Newspaper, value: "breakthroughs" },
        { label: "Clinical Trials", icon: Newspaper, value: "clinical-trials" },
        { label: "Policy", icon: Newspaper, value: "policy" },
        { label: "Opinion", icon: Newspaper, value: "opinion" },
      ],
      lookup: [
        { label: "Symptoms", icon: Search, value: "symptoms" },
        { label: "Specialists", icon: Search, value: "specialists" },
        { label: "Centers", icon: Search, value: "centers" },
        { label: "Prognosis", icon: Search, value: "prognosis" },
        { label: "Trends", icon: Search, value: "trends" },
      ],
    },
  };
