export type FeedbackFormData = {
  title: string;
  description: string;
  category: "Bug" | "Feature Request" | "Improvement" | "Other" | "";
  submitterName: string;
  submitterEmail: string;
};

export type FeedbackApiResponse = {
  success: boolean;
  message: string;
  data: unknown;
  error: string | null;
};

export type FeedbackItem = {
  _id: string;
  title: string;
  category: string;
  status: "New" | "In Review" | "Resolved";
  ai_sentiment?: string;
  ai_priority?: number;
  ai_summary?: string;
  ai_tags?: string[];
  createdAt: string;
};