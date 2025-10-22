// This file defines the configuration for the Dialer component to help the user make common searches for life decisions.
import {
  ShoppingCart,
  BookOpen,
  Users,
  Newspaper,
  Wrench,
  Gamepad2,
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
  CloudSun,
  Map,
  Home,
  Smartphone,
  Tv,
  Laptop,
  Computer,
  Tablet,
  Headphones,
  CookingPot,
  Sofa,
  Bed,
  Warehouse,
  Sprout,
  Shirt,
  Film,
  Music as MusicIcon,
  type LucideIcon,
  Bath,
  ClipboardCheck,
  Paintbrush,
  Code,
  TerminalSquare,
  Watch,
  Sparkles,
  Footprints,
  Backpack,
  Car,
  Plane,
  Hotel,
  Utensils,
  Ticket,
} from "lucide-react";

export interface MenuItem {
  label: string;
  icon: LucideIcon;
  value: string;
}

export interface DialerConfig {
  [key: string]: MenuItem[];
}

export const dialerConfig: {
  topLevel: MenuItem[];
  secondLevel: DialerConfig;
} = {
  topLevel: [
    { label: "Electronics", icon: Monitor, value: "electronics" },
    { label: "Home", icon: Home, value: "home" },
    { label: "Fashion", icon: Shirt, value: "fashion" },
    { label: "Travel", icon: Plane, value: "travel" },
    { label: "Software", icon: Wrench, value: "software" },
    { label: "Health", icon: HeartPulse, value: "health" },
    { label: "Food & Grocery", icon: Apple, value: "food-grocery" },
    { label: "Sports & Fitness", icon: Dumbbell, value: "sports-fitness" },
    { label: "Books", icon: Book, value: "books" },
    { label: "Entertainment", icon: Film, value: "entertainment" },
    { label: "Music", icon: MusicIcon, value: "music" },
    { label: "Socialize", icon: Users, value: "socialize" },
  ],
  secondLevel: {
    electronics: [
      { label: "Smartphones", icon: Smartphone, value: "smartphones" },
      { label: "TVs", icon: Tv, value: "tvs" },
      { label: "Laptops", icon: Laptop, value: "laptops" },
      { label: "Desktops", icon: Computer, value: "desktops" },
      { label: "Tablets", icon: Tablet, value: "tablets" },
      { label: "Accessories", icon: Headphones, value: "device-accessories" },
    ],
    home: [
      { label: "Kitchen", icon: CookingPot, value: "kitchen" },
      { label: "Living Room", icon: Sofa, value: "living-room" },
      { label: "Bedroom", icon: Bed, value: "bedroom" },
      { label: "Bathroom", icon: Bath, value: "bathroom" },
      { label: "Garage", icon: Warehouse, value: "garage" },
      { label: "Lawn & Garden", icon: Sprout, value: "lawn-garden" },
    ],
    fashion: [
      { label: "Tops", icon: Shirt, value: "tops" },
      { label: "Bottoms", icon: Footprints, value: "bottoms" },
      { label: "Shoes", icon: Footprints, value: "shoes" },
      { label: "Accessories", icon: Backpack, value: "accessories" },
    ],
    travel: [
      { label: "Flights", icon: Plane, value: "flights" },
      { label: "Hotels", icon: Hotel, value: "hotels" },
      { label: "Car Rentals", icon: Car, value: "car-rentals" },
      { label: "Restaurants", icon: Utensils, value: "restaurants" },
      { label: "Activities", icon: Ticket, value: "activities" },
    ],
    software: [
      { label: "Productivity", icon: ClipboardCheck, value: "productivity" },
      { label: "Creative", icon: Paintbrush, value: "creative" },
      { label: "Development", icon: Code, value: "development" },
      { label: "Utilities", icon: Wrench, value: "utilities" },
      { label: "OS", icon: TerminalSquare, value: "operating-systems" },
    ],
    health: [
      { label: "Vitamins", icon: Pill, value: "vitamins" },
      { label: "Fitness Trackers", icon: Watch, value: "fitness-trackers" },
      { label: "Personal Care", icon: Sparkles, value: "personal-care" },
      {
        label: "Medical Supplies",
        icon: Stethoscope,
        value: "medical-supplies",
      },
    ],
    "food-grocery": [],
    "sports-fitness": [],
    books: [],
    entertainment: [
      { label: "Movies", icon: Film, value: "movies" },
      { label: "TV Shows", icon: Tv, value: "tv-shows" },
      { label: "Games", icon: Gamepad2, value: "games" },
    ],
    music: [
      { label: "Artists", icon: UserCog, value: "artists" },
      { label: "Albums", icon: MusicIcon, value: "albums" },
      { label: "Songs", icon: MusicIcon, value: "songs" },
    ],
    socialize: [
      { label: "Events", icon: Calendar, value: "events" },
      { label: "Groups", icon: Group, value: "groups" },
      { label: "Forums", icon: MessageSquare, value: "forums" },
    ],
  },
};
