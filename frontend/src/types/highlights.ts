export type HighlightKind = "all" | "full" | "goals";

export interface HighlightVideo {
  id: string;
  title: string;
  description: string;
  channelTitle: string;
  channelId: string;
  thumbnail: string;
  publishedAt: string;
  videoUrl: string;
  embedUrl: string;
}

export interface HighlightsResponse {
  success: boolean;
  videos: HighlightVideo[];
  kind?: HighlightKind;
  failedSources?: string[];
  error?: string;
  updatedAt?: string;
}
