export type TipCategory = "Detox" | "Environment" | "Focus" | "Rehabit";

export type TipIcon =
  | "bell-off-outline"
  | "cellphone-remove"
  | "gesture-tap"
  | "clock-outline"
  | "shape-outline";

export type TipCardLayout = "featured" | "offset" | "centered" | "schedule" | "index";

export type TipSection = {
  title: string;
  body: string[];
  items?: string[];
  numbered?: boolean;
};

export type Tip = {
  id: string;
  category: TipCategory;
  title: string;
  description: string;
  backgroundColor: string;
  accentColor: string;
  foregroundColor: string;
  icon: TipIcon;
  readTime: number;
  cardLayout: TipCardLayout;
  sections: TipSection[];
};

export const tips: Tip[] = [
  {
    id: "silence-social-notifications",
    category: "Detox",
    title: "Your social apps don’t need to call you",
    description: "Turn off the triggers that keep pulling your attention back.",
    backgroundColor: "#062E47",
    accentColor: "#67DDFC",
    foregroundColor: "#F7FDFF",
    icon: "bell-off-outline",
    readTime: 2,
    cardLayout: "featured",
    sections: [
      {
        title: "Why this works",
        body: [
          "Social notifications are external triggers. A like, suggested post, trend, or recommendation creates a new reason to check an app even when you had no intention of opening it.",
          "Removing those calls gives you back the choice. You can still use social media, but you open it deliberately instead of being summoned by it.",
        ],
      },
      {
        title: "Try this now",
        body: ["Review every social app that can interrupt you."],
        items: [
          "Open Android Settings and go to Notifications.",
          "Select Instagram, TikTok, X, Facebook, Threads, Reddit, and similar apps.",
          "Disable likes, suggestions, recommendations, trending content, new-post alerts, and engagement updates.",
          "Keep direct person-to-person messages only if you genuinely need them.",
        ],
        numbered: true,
      },
      {
        title: "What to replace it with",
        body: [
          "Replace notification-led checking with a small intentional window. Decide when you want to open the app, set a short limit, and close it when that time ends.",
        ],
      },
    ],
  },
  {
    id: "move-social-apps",
    category: "Environment",
    title: "Make scrolling harder to start",
    description: "Add one small moment of friction before an automatic habit.",
    backgroundColor: "#BCEED8",
    accentColor: "#08725A",
    foregroundColor: "#083D35",
    icon: "cellphone-remove",
    readTime: 1,
    cardLayout: "offset",
    sections: [
      {
        title: "Why this works",
        body: [
          "A visible social icon can become a cue by itself. Your thumb learns its position and opens it before you have made a conscious decision.",
          "Moving the app does not ban it. It inserts a brief pause where intention can catch up with the reflex.",
        ],
      },
      {
        title: "Try this now",
        body: ["Make social apps available, but no longer effortless to enter."],
        items: [
          "Move every social app away from your first home screen.",
          "Put them inside a folder on a later page.",
          "Remove social widgets and quick-access shortcuts.",
          "Use system search when you actually intend to open one.",
        ],
        numbered: true,
      },
      {
        title: "What to replace it with",
        body: [
          "Use the newly available home-screen space for a book, journal, course, workout, or another tool you want to reach for first.",
        ],
      },
    ],
  },
  {
    id: "replace-the-reflex",
    category: "Rehabit",
    title: "Give your thumb somewhere better to go",
    description: "Substitute the habit instead of relying on restriction alone.",
    backgroundColor: "#DED5F7",
    accentColor: "#61518F",
    foregroundColor: "#302650",
    icon: "gesture-tap",
    readTime: 2,
    cardLayout: "centered",
    sections: [
      {
        title: "Why this works",
        body: [
          "Blocking removes an option, but it does not answer the automatic urge to tap. Habit substitution gives that urge a better destination.",
          "Place a useful app where the distracting app used to be. When your thumb follows the old route, the valuable alternative becomes the easiest choice.",
        ],
      },
      {
        title: "Try this now",
        body: ["Choose one replacement for each app you open automatically."],
        items: [
          "Instagram → Kindle",
          "TikTok → Duolingo",
          "X → Readwise",
          "Reddit → a podcast or learning app",
        ],
      },
      {
        title: "What to replace it with",
        body: [
          "Reading, language learning, meditation, journaling, podcasts, creative tools, and health apps all work when they match something you genuinely value.",
        ],
      },
    ],
  },
  {
    id: "social-media-windows",
    category: "Focus",
    title: "Choose when social media exists",
    description: "Turn an all-day background behavior into a deliberate activity.",
    backgroundColor: "#FFD8C3",
    accentColor: "#B44C32",
    foregroundColor: "#5B2B20",
    icon: "clock-outline",
    readTime: 2,
    cardLayout: "schedule",
    sections: [
      {
        title: "Why this works",
        body: [
          "Checking throughout the day keeps part of your attention waiting for the next update. Defined windows remove that constant negotiation.",
          "The objective is not to never use social media. It is to make it a deliberate activity with a beginning and an end.",
        ],
      },
      {
        title: "Try this now",
        body: ["Pick two realistic windows and keep them short."],
        items: [
          "12:30 PM → 15 minutes",
          "7:00 PM → 20 minutes",
          "Keep social apps blocked or harder to access outside those windows.",
          "Adjust the schedule after a week based on what you actually need.",
        ],
        numbered: true,
      },
      {
        title: "What to replace it with",
        body: [
          "When you feel the urge outside a window, open a saved article, take a short walk, play a podcast, or write down what you wanted to check for later.",
        ],
      },
    ],
  },
  {
    id: "make-phone-useful",
    category: "Rehabit",
    title: "Build a phone you actually want to use",
    description: "Design your home screen around the person you want to become.",
    backgroundColor: "#CDEBFA",
    accentColor: "#087EAF",
    foregroundColor: "#073D57",
    icon: "shape-outline",
    readTime: 3,
    cardLayout: "index",
    sections: [
      {
        title: "Why this works",
        body: [
          "Your home screen is an environment. What it makes visible and easy becomes more likely to happen, so arranging it around your values can redirect dozens of small choices each day.",
          "The goal isn’t to hate your phone. It’s to make the phone serve the person you want to become.",
        ],
      },
      {
        title: "Try this now",
        body: ["Create a simple first screen made only of useful destinations."],
        items: [
          "READ — Kindle, Readwise",
          "LEARN — Duolingo, Khan Academy",
          "CREATE — Notes, Camera, music or drawing tools",
          "RESET — Meditation, Journal, Breathing",
          "MOVE — Workout, Running, Walking",
        ],
      },
      {
        title: "What to replace it with",
        body: [
          "Move one useful app into the exact position previously occupied by your biggest distraction. Start with one substitution and let the new layout become familiar.",
        ],
      },
    ],
  },
];

export function getTipById(id: string | undefined) {
  return tips.find((tip) => tip.id === id);
}
