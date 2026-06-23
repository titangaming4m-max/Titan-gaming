export interface RedeemCode {
  id: string;
  title: string;
  code: string;
  description: string;
  expiryDate?: string;
  createdAt: string;
  active: boolean;
}

export interface UserProfile {
  email: string;
  createdAt: string;
  favoriteVideoIds?: string[];
  redeemedCodeIds?: string[];
}

export interface YoutubeVideo {
  id: string;
  title: string;
  publishedAt: string;
  thumbnailUrl: string;
  url: string;
  channelTitle: string;
  viewCount?: string;
}

export interface AdminSettings {
  channelId: string;
  apiKey?: string;
  fallbackChannelName?: string;
}
