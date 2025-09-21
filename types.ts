
export interface ArtDirection {
  title: string;
  description: string;
}

export interface CampaignResult {
  id: string;
  src: string | null;
  status: 'generating' | 'completed' | 'failed';
  direction: ArtDirection;
  error: string | null;
}

export type AspectRatio = '1/1' | '4/5' | '3/4' | '16/9';
export type OutputQuality = 'HD' | 'Pro';
