"use client";

import { useMemo, useState } from "react";
import { api } from "@/lib/api";
import { FeedbackFormData } from "@/types/feedback";

const initialForm: FeedbackFormData = {
  title: "",
  description: "",
  category: "",
  submitterName: "",
  submitterEmail: "",
};

type FormErrors = Partial<Record<keyof FeedbackFormData, string>>;

export default function FeedbackForm() {
  const [formData, setFormData] = useState<FeedbackFormData>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [serverError, setServerError] = useState("");

  const descriptionCount = useMemo(
    () => formData.description.length,
    [formData.description]
  );

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.trim().length < 20) {
      newErrors.description = "Description must be at least 20 characters";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (
      formData.submitterEmail.trim() &&
      !/^\S+@\S+\.\S+$/.test(formData.submitterEmail)
    ) {
      newErrors.submitterEmail = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setSuccessMessage("");
    setServerError("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setSuccessMessage("");
    setServerError("");

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        submitterName: formData.submitterName.trim(),
        submitterEmail: formData.submitterEmail.trim(),
      };

      const response = await api.post("/feedback", payload);

      if (response.data?.success) {
        setSuccessMessage("Feedback submitted successfully.");
        setFormData(initialForm);
        setErrors({});
      } else {
        setServerError(response.data?.error || "Something went wrong.");
      }
    } catch (error: unknown) {
      const apiError = error as {
        response?: {
          data?: {
            error?: string;
            message?: string;
          };
        };
      };

      setServerError(
        apiError.response?.data?.error ||
          apiError.response?.data?.message ||
          "Failed to submit feedback."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl rounded-2xl border bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          Submit Product Feedback
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Share bugs, feature requests, or improvements to help the team build better.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="title" className="mb-2 block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            maxLength={120}
            value={formData.title}
            onChange={handleChange}
            placeholder="Short summary of your feedback"
            className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-300 text-gray-700"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="description"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={5}
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the issue, request, or improvement in detail"
            className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-300 text-gray-700"
          />
          <div className="mt-1 flex items-center justify-between">
            {errors.description ? (
              <p className="text-sm text-red-600">{errors.description}</p>
            ) : (
              <p className="text-sm text-gray-500">Minimum 20 characters</p>
            )}
            <p className="text-sm text-gray-500">{descriptionCount} characters</p>
          </div>
        </div>

        <div>
          <label htmlFor="category" className="mb-2 block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-300 text-gray-700"
          >
            <option value="">Select a category</option>
            <option value="Bug">Bug</option>
            <option value="Feature Request">Feature Request</option>
            <option value="Improvement">Improvement</option>
            <option value="Other">Other</option>
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">{errors.category}</p>
          )}
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label
              htmlFor="submitterName"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Name (optional)
            </label>
            <input
              id="submitterName"
              name="submitterName"
              type="text"
              value={formData.submitterName}
              onChange={handleChange}
              placeholder="Your name"
              className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-300 text-gray-700"
            />
          </div>

          <div>
            <label
              htmlFor="submitterEmail"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Email (optional)
            </label>
            <input
              id="submitterEmail"
              name="submitterEmail"
              type="email"
              value={formData.submitterEmail}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-300 text-gray-700"
            />
            {errors.submitterEmail && (
              <p className="mt-1 text-sm text-red-600">{errors.submitterEmail}</p>
            )}
          </div>
        </div>

        {successMessage && (
          <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {successMessage}
          </div>
        )}

        {serverError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {serverError}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
        >
          {isSubmitting ? "Submitting..." : "Submit Feedback"}
        </button>
      </form>
    </div>
  );
}