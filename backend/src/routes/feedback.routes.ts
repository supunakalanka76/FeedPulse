import { Router } from "express";
import {
  createFeedback,
  deleteFeedback,
  getAllFeedback,
  getFeedbackById,
  getFeedbackSummary,
  updateFeedbackStatus,
} from "../controllers/feedback.controller";
import { protectAdmin } from "../middleware/auth.middleware";

const router = Router();

router.post("/", createFeedback);

router.get("/", protectAdmin, getAllFeedback);
router.get("/summary", protectAdmin, getFeedbackSummary);
router.get("/:id", protectAdmin, getFeedbackById);
router.patch("/:id", protectAdmin, updateFeedbackStatus);
router.delete("/:id", protectAdmin, deleteFeedback);

export default router;