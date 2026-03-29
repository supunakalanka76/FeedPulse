import { Request, Response } from "express";
import {
  createFeedbackService,
  deleteFeedbackService,
  getAllFeedbackService,
  getFeedbackByIdService,
  getFeedbackSummaryService,
  updateFeedbackStatusService,
} from "../services/feedback.service";

// Controller to handle feedback-related requests
export const createFeedback = async (req: Request, res: Response) => {
  try {
    const result = await createFeedbackService(req.body);

    return res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      data: result,
      error: null,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: "Failed to submit feedback",
      data: null,
      error: error.message,
    });
  }
};

// Controller to retrieve feedback with filtering, pagination, and sorting
export const getAllFeedback = async (req: Request, res: Response) => {
  try {
    const result = await getAllFeedbackService(req.query);

    return res.status(200).json({
      success: true,
      message: "Feedback retrieved successfully",
      data: result,
      error: null,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve feedback",
      data: null,
      error: error.message,
    });
  }
};

// Controller to update feedback status
export const updateFeedbackStatus = async (req: Request, res: Response) => {
  try {
    const result = await updateFeedbackStatusService(
      req.params.id as string,
      req.body.status as string
    );

    return res.status(200).json({
      success: true,
      message: "Feedback status updated successfully",
      data: result,
      error: null,
    });
  } catch (error: any) {
    const statusCode =
      error.message === "Feedback not found" ? 404 : 400;

    return res.status(statusCode).json({
      success: false,
      message: "Failed to update feedback status",
      data: null,
      error: error.message,
    });
  }
};

// Controller to retrieve feedback by ID
export const getFeedbackById = async (req: Request, res: Response) => {
  try {
    const result = await getFeedbackByIdService(req.params.id as string);

    return res.status(200).json({
      success: true,
      message: "Feedback retrieved successfully",
      data: result,
      error: null,
    });
  } catch (error: any) {
    const statusCode = error.message === "Feedback not found" ? 404 : 400;

    return res.status(statusCode).json({
      success: false,
      message: "Failed to retrieve feedback",
      data: null,
      error: error.message,
    });
  }
};

// Controller to delete feedback
export const deleteFeedback = async (req: Request, res: Response) => {
  try {
    const result = await deleteFeedbackService(req.params.id as string);

    return res.status(200).json({
      success: true,
      message: "Feedback deleted successfully",
      data: result,
      error: null,
    });
  } catch (error: any) {
    const statusCode = error.message === "Feedback not found" ? 404 : 400;

    return res.status(statusCode).json({
      success: false,
      message: "Failed to delete feedback",
      data: null,
      error: error.message,
    });
  }
};

// Controller to retrieve feedback summary and themes using Gemini AI
export const getFeedbackSummary = async (req: Request, res: Response) => {
  try {
    const result = await getFeedbackSummaryService();

    return res.status(200).json({
      success: true,
      message: "Feedback summary retrieved successfully",
      data: result,
      error: null,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve feedback summary",
      data: null,
      error: error.message,
    });
  }
};