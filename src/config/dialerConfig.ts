import {
  ShoppingCart,
  BookOpen,
  Users,
  Newspaper,
  Wrench, // For Tools & Utilities
  Gamepad2, // For Entertainment
  Monitor,
  Pill,
  Handshake,
  Book,
  GraduationCap,
  Video,
  FlaskConical,
  MessageSquare,
  Group,
  Calendar,
  Lightbulb,
  UserCog,
  Megaphone,
  Scale,
  Hospital,
  LineChart,
  HeartPulse,
  Apple,
  Dumbbell,
  Stethoscope,
  CloudSun, // For Weather
  Map, // For Maps
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
      { label: "Shopping", icon: ShoppingCart, value: "shopping" },
      { label: "Information", icon: BookOpen, value: "information" },
      { label: "Local & Travel", icon: Map, value: "local" },
      { label: "Technology", icon: Monitor, value: "technology" },
      { label: "Entertainment", icon: Gamepad2, value: "entertainment" }
    ],
    secondLevel: {
      shopping: [
        { label: "Electronics", icon: Monitor, value: "electronics" },
        { label: "Software & Apps", icon: Wrench, value: "software" },
        { label: "Health Products", icon: HeartPulse, value: "health-products" },
        { label: "Home & Garden", icon: Users, value: "home-garden" },
        { label: "Fashion", icon: ShoppingCart, value: "fashion" },
        { label: "Food & Grocery", icon: Apple, value: "food-grocery" },
        { label: "Sports & Fitness", icon: Dumbbell, value: "sports-fitness" },
        { label: "Books & Media", icon: Book, value: "books-media" },
      ],
      information: [
        { label: "Tutorials & Guides", icon: BookOpen, value: "tutorials" },
        { label: "Research & Studies", icon: FlaskConical, value: "research" },
        { label: "Health Info", icon: Stethoscope, value: "health-info" },
        { label: "Online Courses", icon: GraduationCap, value: "courses" },
        { label: "Reviews", icon: MessageSquare, value: "reviews" },
        { label: "How-To Articles", icon: Lightbulb, value: "how-to" },
        { label: "Weather", icon: CloudSun, value: "weather-maps" },
        { label: "Finance & Money", icon: LineChart, value: "finance" },
      ],
      local: [
        { label: "Restaurants", icon: Apple, value: "restaurants" },
        { label: "Services", icon: Handshake, value: "local-services" },
        { label: "Medical Care", icon: Hospital, value: "medical-care" },
        { label: "Hotels & Lodging", icon: Calendar, value: "hotels" },
        { label: "Attractions", icon: Map, value: "attractions" },
        { label: "Professionals", icon: UserCog, value: "professionals" },
        { label: "Events", icon: Calendar, value: "local-events" },
        { label: "Transportation", icon: Map, value: "transportation" },
      ],
      technology: [
        { label: "Tech News", icon: Newspaper, value: "tech-news" },
        { label: "Product Reviews", icon: Monitor, value: "tech-reviews" },
        { label: "Software Tools", icon: Wrench, value: "software-tools" },
        { label: "Development", icon: BookOpen, value: "development" },
        { label: "AI & Innovation", icon: Lightbulb, value: "ai-innovation" },
        { label: "Gadgets", icon: Monitor, value: "gadgets" },
        { label: "Cybersecurity", icon: Scale, value: "cybersecurity" },
        { label: "Gaming Tech", icon: Gamepad2, value: "gaming-tech" },
      ],
      entertainment: [
        { label: "Movies & TV", icon: Video, value: "movies-tv" },
        { label: "Video Games", icon: Gamepad2, value: "video-games" },
        { label: "Music", icon: MessageSquare, value: "music" },
        { label: "Books & Reading", icon: Book, value: "books-reading" },
        { label: "Sports", icon: Dumbbell, value: "sports" },
        { label: "Forums & Social", icon: MessageSquare, value: "forums" },
        { label: "Streaming", icon: Video, value: "streaming" },
        { label: "Events & Shows", icon: Calendar, value: "events-shows" },
      ],
    },
  };
