import { 
  Feedback, 
  IFeedback 
} from "../models/feedback.model";
import { 
  analyzeFeedbackWithGemini,
  generateFeedbackSummaryWithGemini, 
} from "./gemini.service";

type FeedbackQuery = {
  category?: string;
  status?: string;
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: string;
};

// Service to create new feedback
export const createFeedbackService = async (
  payload: Partial<IFeedback>
) => {
  if (!payload.title || !payload.description || !payload.category) {
    throw new Error("Title, description, and category are required");
  }

  if (!payload.title.trim()) {
    throw new Error("Title cannot be empty");
  }

  if (!payload.description.trim()) {
    throw new Error("Description cannot be empty");
  }

  if (payload.description.trim().length < 20) {
    throw new Error("Description must be at least 20 characters");
  }

  const allowedCategories = [
    "Bug",
    "Feature Request",
    "Improvement",
    "Other",
  ];

  if (!allowedCategories.includes(payload.category)) {
    throw new Error("Invalid category");
  }

  const feedback = await Feedback.create({
    title: payload.title.trim(),
    description: payload.description.trim(),
    category: payload.category,
    submitterName: payload.submitterName?.trim(),
    submitterEmail: payload.submitterEmail?.trim(),
  });

  // Run Gemini analysis after feedback is saved
  try {
    const aiResult = await analyzeFeedbackWithGemini(
      feedback.title,
      feedback.description
    );

    await Feedback.findByIdAndUpdate(feedback._id, {
      ai_category: aiResult.category,
      ai_sentiment: aiResult.sentiment,
      ai_priority: aiResult.priority_score,
      ai_summary: aiResult.summary,
      ai_tags: aiResult.tags,
      ai_processed: true,
    });
  } catch (error) {
    console.error("AI processing failed, but feedback was saved:", error);
  }

  return feedback;
};

// Service to retrieve feedback with filtering, pagination, and sorting
export const getAllFeedbackService = async (query: FeedbackQuery) => {
  const {
    category,
    status,
    page = "1",
    limit = "10",
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;

  const filters: Record<string, any> = {};

  if (category) {
    filters.category = category;
  }

  if (status) {
    filters.status = status;
  }

  const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
  const limitNumber = Math.max(parseInt(limit, 10) || 10, 1);
  const skip = (pageNumber - 1) * limitNumber;

  const allowedSortFields = ["createdAt", "ai_priority", "ai_sentiment"];
  const finalSortBy = allowedSortFields.includes(sortBy)
    ? sortBy
    : "createdAt";

  const finalSortOrder = sortOrder === "asc" ? 1 : -1;

  const [feedback, total] = await Promise.all([
    Feedback.find(filters)
      .sort({ [finalSortBy]: finalSortOrder })
      .skip(skip)
      .limit(limitNumber),
    Feedback.countDocuments(filters),
  ]);

  return {
    items: feedback,
    pagination: {
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber),
    },
  };
};

// Service to update feedback status
export const updateFeedbackStatusService = async (
  id: string,
  status: string
) => {
  const allowedStatuses = ["New", "In Review", "Resolved"];

  if (!status) {
    throw new Error("Status is required");
  }

  if (!allowedStatuses.includes(status)) {
    throw new Error("Invalid status value");
  }

  const updatedFeedback = await Feedback.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  );

  if (!updatedFeedback) {
    throw new Error("Feedback not found");
  }

  return updatedFeedback;
};

// Service to retrieve feedback by ID
export const getFeedbackByIdService = async (id: string) => {
  const feedback = await Feedback.findById(id);

  if (!feedback) {
    throw new Error("Feedback not found");
  }

  return feedback;
};

// Service to delete feedback by ID
export const deleteFeedbackService = async (id: string) => {
  const deletedFeedback = await Feedback.findByIdAndDelete(id);

  if (!deletedFeedback) {
    throw new Error("Feedback not found");
  }

  return deletedFeedback;
};

// Analyze feedback using Gemini AI
export const getFeedbackSummaryService = async () => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const feedbackItems = await Feedback.find({
    createdAt: { $gte: sevenDaysAgo },
  })
    .sort({ createdAt: -1 })
    .select("title description category ai_summary ai_tags createdAt");

  if (feedbackItems.length === 0) {
    return {
      summary: "No feedback submitted in the last 7 days.",
      topThemes: [],
      totalFeedback: 0,
    };
  }

  const summary = await generateFeedbackSummaryWithGemini(feedbackItems);

  return summary;
};