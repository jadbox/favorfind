import {
  ShoppingCart,
  BookOpen,
  Map,
  Users,
  Newspaper,
  Search,
  type LucideIcon,
  Monitor, // For Devices, Software
  Pill, // For Supplements
  Handshake, // For Services
  Book, // For Books, Articles
  GraduationCap, // For Courses, Tutors
  Video, // For Videos
  FlaskConical, // For Studies, Clinical Trials
  MessageSquare, // For Forums
  Group, // For Groups
  Calendar, // For Events
  Lightbulb, // For Experts, Breakthroughs
  UserCog, // For Mentors
  Megaphone, // For Latest, News
  Scale, // For Policy
  Stethoscope, // For Symptoms, Specialists, Diagnosis
  Hospital, // For Centers
  LineChart, // For Prognosis, Trends
  HeartPulse, // For Treatment, Prevention
  Apple, // For Nutrition
  Dumbbell, // For Fitness
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
        { label: "Devices", icon: Monitor, value: "devices" },
        { label: "Supplements", icon: Pill, value: "supplements" },
        { label: "Services", icon: Handshake, value: "services" },
        { label: "Books", icon: Book, value: "books" },
        { label: "Software", icon: Monitor, value: "software" },
      ],
      learn: [
        { label: "Courses", icon: GraduationCap, value: "courses" },
        { label: "Articles", icon: Book, value: "articles" },
        { label: "Videos", icon: Video, value: "videos" },
        { label: "Tutors", icon: GraduationCap, value: "tutors" },
        { label: "Studies", icon: FlaskConical, value: "studies" },
      ],
      guide: [
        { label: "Treatment", icon: HeartPulse, value: "treatment" },
        { label: "Prevention", icon: HeartPulse, value: "prevention" },
        { label: "Diagnosis", icon: Stethoscope, value: "diagnosis" },
        { label: "Nutrition", icon: Apple, value: "nutrition" },
        { label: "Fitness", icon: Dumbbell, value: "fitness" },
      ],
      social: [
        { label: "Forums", icon: MessageSquare, value: "forums" },
        { label: "Groups", icon: Group, value: "groups" },
        { label: "Events", icon: Calendar, value: "events" },
        { label: "Experts", icon: Lightbulb, value: "experts" },
        { label: "Mentors", icon: UserCog, value: "mentors" },
      ],
      news: [
        { label: "Latest", icon: Megaphone, value: "latest" },
        { label: "Breakthroughs", icon: Lightbulb, value: "breakthroughs" },
        { label: "Clinical Trials", icon: FlaskConical, value: "clinical-trials" },
        { label: "Policy", icon: Scale, value: "policy" },
        { label: "Opinion", icon: MessageSquare, value: "opinion" },
      ],
      lookup: [
        { label: "Symptoms", icon: Stethoscope, value: "symptoms" },
        { label: "Specialists", icon: Stethoscope, value: "specialists" },
        { label: "Centers", icon: Hospital, value: "centers" },
        { label: "Prognosis", icon: LineChart, value: "prognosis" },
        { label: "Trends", icon: LineChart, value: "trends" },
      ],
    },
  };
