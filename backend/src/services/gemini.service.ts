import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

// Analyze feedback using Gemini AI
export const analyzeFeedbackWithGemini = async (
  title: string,
  description: string
) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = `
Analyse this product feedback.

Title: ${title}
Description: ${description}

Return ONLY valid JSON in this exact format:
{
  "category": "Bug | Feature Request | Improvement | Other",
  "sentiment": "Positive | Neutral | Negative",
  "priority_score": 1,
  "summary": "short summary",
  "tags": ["tag1", "tag2"]
}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    return {
      category: parsed.category,
      sentiment: parsed.sentiment,
      priority_score: parsed.priority_score,
      summary: parsed.summary,
      tags: Array.isArray(parsed.tags) ? parsed.tags : [],
    };
  } catch (error: any) {
    console.error("Gemini error details:", error?.message || error);
    throw new Error("AI processing failed");
  }
};

// Generate feedback summary and themes using Gemini AI
export const generateFeedbackSummaryWithGemini = async (
  feedbackItems: Array<{
    title: string;
    description: string;
    category?: string;
    ai_summary?: string;
    ai_tags?: string[];
  }>
) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const feedbackText = feedbackItems
      .map((item, index) => {
        return `
Feedback ${index + 1}:
Title: ${item.title}
Description: ${item.description}
Category: ${item.category || "Unknown"}
AI Summary: ${item.ai_summary || "Not available"}
Tags: ${(item.ai_tags || []).join(", ")}
`;
      })
      .join("\n");

    const prompt = `
You are analyzing product feedback from the last 7 days.

Based on the feedback below, return ONLY valid JSON in this exact format:
{
  "summary": "short paragraph summary",
  "topThemes": ["theme 1", "theme 2", "theme 3"],
  "totalFeedback": 0
}

Feedback data:
${feedbackText}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    return {
      summary: parsed.summary,
      topThemes: Array.isArray(parsed.topThemes) ? parsed.topThemes : [],
      totalFeedback:
        typeof parsed.totalFeedback === "number"
          ? parsed.totalFeedback
          : feedbackItems.length,
    };
  } catch (error: any) {
    console.error("Gemini summary error details:", error?.message || error);
    throw new Error("AI summary generation failed");
  }
};