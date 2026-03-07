export type PostPlatform = 'linkedin' | 'twitter';
export type PostStatus = 'draft' | 'posted';

export interface AutomationPost {
  id: string;
  platform: PostPlatform;
  content: string;
  topic: string;
  status: PostStatus;
  postedAt?: string;
  createdAt: string;
  updatedAt: string;
}
