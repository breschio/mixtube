
export interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle?: string;
}

export interface Mix {
  id: number;
  title: string;
  userId: number;
  leftVideoId: string;
  leftTitle?: string;
  leftChannel?: string;
  rightVideoId: string;
  rightTitle?: string;
  rightChannel?: string;
  crossFaderValue: number;
  template: string;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface MixTemplate {
  id: string;
  title: string;
  crossFaderValue: number;
  description?: string;
}
