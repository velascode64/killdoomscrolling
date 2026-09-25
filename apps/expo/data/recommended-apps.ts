export type RecommendedCategory = "reading" | "learning" | "meditation" | "fitness" | "focus" | "productivity" | "work" | "music";
export interface RecommendedApp { id: string; name: string; packageName: string; iconUrl: string; category: RecommendedCategory; playStore: string; appStore: string }

const app = (id: string, name: string, packageName: string, category: RecommendedCategory, domain: string, playStore: string, appStore: string): RecommendedApp => ({ id, name, packageName, category, iconUrl: `https://www.google.com/s2/favicons?domain=${domain}&sz=128`, playStore, appStore });

export const RECOMMENDED_APPS: RecommendedApp[] = [
  app("kindle", "Amazon Kindle", "com.amazon.kindle", "reading", "amazon.com", "https://play.google.com/store/apps/details?id=com.amazon.kindle", "https://apps.apple.com/us/app/amazon-kindle/id302584613"),
  app("google-play-books", "Google Play Books", "com.google.android.apps.books", "reading", "play.google.com", "https://play.google.com/store/apps/details?id=com.google.android.apps.books", "https://apps.apple.com/us/app/google-play-books-audiobooks/id400989007"),
  app("duolingo", "Duolingo", "com.duolingo", "learning", "duolingo.com", "https://play.google.com/store/apps/details?id=com.duolingo", "https://apps.apple.com/us/app/duolingo-language-lessons/id570060128"),
  app("khan-academy", "Khan Academy", "org.khanacademy.android", "learning", "khanacademy.org", "https://play.google.com/store/apps/details?id=org.khanacademy.android", "https://apps.apple.com/us/app/khan-academy/id469863705"),
  app("calm", "Calm", "com.calm.android", "meditation", "calm.com", "https://play.google.com/store/apps/details?id=com.calm.android", "https://apps.apple.com/us/app/calm/id571800810"),
  app("headspace", "Headspace", "com.getsomeheadspace.android", "meditation", "headspace.com", "https://play.google.com/store/apps/details?id=com.getsomeheadspace.android", "https://apps.apple.com/us/app/headspace-meditation-sleep/id493145008"),
  app("nike-training-club", "Nike Training Club", "com.nike.ntc", "fitness", "nike.com", "https://play.google.com/store/apps/details?id=com.nike.ntc", "https://apps.apple.com/us/app/nike-training-club/id301521403"),
  app("strava", "Strava", "com.strava", "fitness", "strava.com", "https://play.google.com/store/apps/details?id=com.strava", "https://apps.apple.com/us/app/strava-run-bike-hike/id426826309"),
  app("forest", "Forest", "cc.forestapp", "focus", "forestapp.cc", "https://play.google.com/store/apps/details?id=cc.forestapp", "https://apps.apple.com/us/app/forest-focus-for-productivity/id866450515"),
  app("focus-to-do", "Focus To-Do", "com.superelement.pomodoro", "focus", "focustodo.cn", "https://play.google.com/store/apps/details?id=com.superelement.pomodoro", "https://apps.apple.com/us/app/focus-to-do-focus-timer-tasks/id966057213"),
  app("todoist", "Todoist", "com.todoist", "productivity", "todoist.com", "https://play.google.com/store/apps/details?id=com.todoist", "https://apps.apple.com/us/app/todoist-to-do-list-calendar/id572688855"),
  app("notion", "Notion", "notion.id", "productivity", "notion.so", "https://play.google.com/store/apps/details?id=notion.id", "https://apps.apple.com/us/app/notion-notes-tasks-ai/id1232780281"),
  app("slack", "Slack", "com.Slack", "work", "slack.com", "https://play.google.com/store/apps/details?id=com.Slack", "https://apps.apple.com/us/app/slack/id618783545"),
  app("microsoft-teams", "Microsoft Teams", "com.microsoft.teams", "work", "microsoft.com", "https://play.google.com/store/apps/details?id=com.microsoft.teams", "https://apps.apple.com/us/app/microsoft-teams/id1113153706"),
  app("spotify", "Spotify", "com.spotify.music", "music", "spotify.com", "https://play.google.com/store/apps/details?id=com.spotify.music", "https://apps.apple.com/us/app/spotify-music-and-podcasts/id324684580"),
  app("youtube-music", "YouTube Music", "com.google.android.apps.youtube.music", "music", "music.youtube.com", "https://play.google.com/store/apps/details?id=com.google.android.apps.youtube.music", "https://apps.apple.com/us/app/youtube-music/id1017492454"),
];
