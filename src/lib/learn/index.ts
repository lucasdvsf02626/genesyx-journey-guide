import articlesJson from "./articles.json";
import heroFirstWeek from "@/assets/learn/learn_hero_first_week.jpg.asset.json";
import heroLogging from "@/assets/learn/learn_hero_logging.jpg.asset.json";
import heroWhatToLog from "@/assets/learn/learn_hero_what_to_log.jpg.asset.json";
import heroHydration from "@/assets/learn/learn_hero_hydration.jpg.asset.json";
import heroEatingCycle from "@/assets/learn/learn_hero_eating_cycle.jpg.asset.json";
import heroSupplements from "@/assets/learn/learn_hero_supplements.jpg.asset.json";
import heroInsights from "@/assets/learn/learn_hero_insights.jpg.asset.json";
import heroTrends from "@/assets/learn/learn_hero_trends.jpg.asset.json";
import heroHabits from "@/assets/learn/learn_hero_habits.jpg.asset.json";
import heroUsing from "@/assets/learn/learn_hero_using.jpg.asset.json";

const HERO_IMAGE_URLS: Record<string, string> = {
  learn_hero_first_week: heroFirstWeek.url,
  learn_hero_logging: heroLogging.url,
  learn_hero_what_to_log: heroWhatToLog.url,
  learn_hero_hydration: heroHydration.url,
  learn_hero_eating_cycle: heroEatingCycle.url,
  learn_hero_supplements: heroSupplements.url,
  learn_hero_insights: heroInsights.url,
  learn_hero_trends: heroTrends.url,
  learn_hero_habits: heroHabits.url,
  learn_hero_using: heroUsing.url,
};

export function getHeroImageUrl(key: string | undefined | null): string | undefined {
  if (!key) return undefined;
  return HERO_IMAGE_URLS[key];
}

export type LearnCategory =
  | "GETTING_STARTED"
  | "TRACKING"
  | "NUTRITION"
  | "INSIGHTS"
  | "WELLNESS";

export type LearnBodyBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "bulletList"; items: string[] }
  | { type: "callout"; text: string };

export type LearnCta = {
  type: string;
  label: string;
  targetSlug: string | null;
} | null;

export type LearnArticle = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: LearnCategory;
  tags: string[];
  readingTime: string;
  heroImage: string;
  featured: boolean;
  relatedArticleIds: string[];
  cta: LearnCta;
  disclaimerRequired: boolean;
  body: LearnBodyBlock[];
};

export const MEDICAL_DISCLAIMER =
  "This article is general information, not medical advice. Speak to a qualified healthcare professional about your own health.";

export const articles: LearnArticle[] = (articlesJson as { articles: LearnArticle[] }).articles;

export const CATEGORY_LABEL: Record<LearnCategory, string> = {
  GETTING_STARTED: "Getting started",
  TRACKING: "Tracking",
  NUTRITION: "Nutrition",
  INSIGHTS: "Insights",
  WELLNESS: "Wellness",
};

export const CATEGORY_ORDER: LearnCategory[] = [
  "GETTING_STARTED",
  "TRACKING",
  "NUTRITION",
  "INSIGHTS",
  "WELLNESS",
];

// Category-tinted gradient fallbacks for hero imagery (British-English palette).
export const CATEGORY_GRADIENT: Record<LearnCategory, string> = {
  GETTING_STARTED: "from-indigo-500/25 via-indigo-400/15 to-transparent",
  TRACKING: "from-violet-500/25 via-violet-400/15 to-transparent",
  NUTRITION: "from-emerald-500/25 via-emerald-400/15 to-transparent",
  INSIGHTS: "from-sky-500/25 via-sky-400/15 to-transparent",
  WELLNESS: "from-rose-500/25 via-rose-400/15 to-transparent",
};

export function getArticleBySlug(slug: string): LearnArticle | undefined {
  return articles.find((a) => a.slug === slug);
}

export function getArticleById(id: string): LearnArticle | undefined {
  return articles.find((a) => a.id === id);
}

export function searchArticles(query: string): LearnArticle[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return articles.filter((a) => {
    if (a.title.toLowerCase().includes(q)) return true;
    if (a.excerpt.toLowerCase().includes(q)) return true;
    return a.tags.some((t) => t.toLowerCase().includes(q));
  });
}
