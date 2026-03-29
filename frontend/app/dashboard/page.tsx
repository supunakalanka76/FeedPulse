"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";
import { useRouter } from "next/navigation";

type FeedbackItem = {
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

type SummaryData = {
  summary: string;
  topThemes: string[];
  totalFeedback: number;
};

export default function DashboardPage() {
      const router = useRouter();

  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [summary, setSummary] = useState<SummaryData | null>(null);

  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const getSentimentBadgeClass = (sentiment?: string) => {
    switch (sentiment) {
      case "Positive":
        return "bg-green-100 text-green-700 border border-green-200";
      case "Negative":
        return "bg-red-100 text-red-700 border border-red-200";
      case "Neutral":
        return "bg-gray-100 text-gray-700 border border-gray-200";
      default:
        return "bg-slate-100 text-slate-600 border border-slate-200";
    }
  };

  const getStatusBadgeClass = (value: string) => {
    switch (value) {
      case "Resolved":
        return "bg-green-100 text-green-700 border border-green-200";
      case "In Review":
        return "bg-yellow-100 text-yellow-700 border border-yellow-200";
      default:
        return "bg-slate-100 text-slate-700 border border-slate-200";
    }
  };

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

const fetchFeedback = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        router.push("/login");
        return;
      }

      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (category) params.append("category", category);
      if (status) params.append("status", status);
      if (debouncedSearch) params.append("search", debouncedSearch);

      params.append("sortBy", sortBy);
      params.append("sortOrder", sortOrder);
      params.append("page", page.toString());

      const res = await api.get(`/feedback?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setItems(res.data?.data?.items || []);
      setTotalPages(res.data?.data?.pagination?.totalPages || 1);
    } catch (err: unknown) {
      if (
        err &&
        typeof err === "object" &&
        "response" in err &&
        (err as { response?: { status?: number } }).response?.status === 401
      ) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      const errorMessage =
        (err &&
        typeof err === "object" &&
        "response" in err
          ? (err as { response?: { data?: { error?: string; message?: string } } })
              .response?.data?.error ||
            (err as { response?: { data?: { error?: string; message?: string } } })
              .response?.data?.message
          : null) || "Failed to load feedback.";

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [category, status, debouncedSearch, sortBy, sortOrder, page, router]);

  const fetchSummary = useCallback(async () => {
    try {
      const token = getAuthToken();

      if (!token) {
        router.push("/login");
        return;
      }

      setSummaryLoading(true);

      const res = await api.get("/feedback/summary", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSummary(res.data?.data || null);
    } catch (err: unknown) {
      if (
        err &&
        typeof err === "object" &&
        "response" in err &&
        (err as { response?: { status?: number } }).response?.status === 401
      ) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      setSummary(null);
    } finally {
      setSummaryLoading(false);
    }
  }, [router]);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const token = getAuthToken();

      if (!token) {
        router.push("/login");
        return;
      }

      setUpdatingId(id);

      await api.patch(
        `/feedback/${id}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setItems((prev) =>
        prev.map((item) =>
          item._id === id
            ? { ...item, status: newStatus as FeedbackItem["status"] }
            : item
        )
      );
    } catch (err: unknown) {
      const errorMessage =
        (err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { error?: string; message?: string } } })
              .response?.data?.error ||
            (err as { response?: { data?: { error?: string; message?: string } } })
              .response?.data?.message
          : null) || "Failed to update status.";

      alert(errorMessage);
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push("/login");
      return;
    }
  }, [router]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const stats = useMemo(() => {
    const totalItems = items.length;
    const resolvedItems = items.filter((item) => item.status === "Resolved").length;
    const inReviewItems = items.filter((item) => item.status === "In Review").length;

    const priorityItems = items.filter(
      (item) => typeof item.ai_priority === "number"
    );

    const averagePriority =
      priorityItems.length > 0
        ? (
            priorityItems.reduce((sum, item) => sum + (item.ai_priority || 0), 0) /
            priorityItems.length
          ).toFixed(1)
        : "0.0";

    return {
      totalItems,
      resolvedItems,
      inReviewItems,
      averagePriority,
    };
  }, [items]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Admin Dashboard
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Review feedback, track AI insights, and update statuses.
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-100 cursor-pointer"
          >
            Logout
          </button>
        </div>

        <section className="mb-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Visible Feedback</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {stats.totalItems}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">In Review</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {stats.inReviewItems}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Resolved Items</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {stats.resolvedItems}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Average Priority</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {stats.averagePriority}
            </p>
          </div>
        </section>

        <section className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">AI Summary</h2>
              <p className="mt-1 text-sm text-gray-500">
                Trends generated from feedback submitted in the last 7 days.
              </p>
            </div>
          </div>

          {summaryLoading ? (
            <div className="mt-4 rounded-xl bg-gray-50 px-4 py-6 text-sm text-gray-600">
              Loading summary...
            </div>
          ) : summary ? (
            <div className="mt-4 space-y-5">
              <p className="text-sm leading-7 text-gray-700">{summary.summary}</p>

              <div>
                <p className="mb-2 text-sm font-medium text-gray-800">Top themes</p>
                <div className="flex flex-wrap gap-2">
                  {summary.topThemes?.length > 0 ? (
                    summary.topThemes.map((theme) => (
                      <span
                        key={theme}
                        className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700"
                      >
                        {theme}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">No themes available.</span>
                  )}
                </div>
              </div>

              <p className="text-sm text-gray-500">
                Total feedback in last 7 days: {summary.totalFeedback}
              </p>
            </div>
          ) : (
            <div className="mt-4 rounded-xl bg-gray-50 px-4 py-6 text-sm text-gray-600">
              No summary available.
            </div>
          )}
        </section>

        <input
          placeholder="Search feedback..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full mb-4 px-4 py-3 border rounded-xl text-gray-700 outline-none focus:ring-2 focus:ring-gray-300"
        />

        {/* SORT */}
        <div className="grid md:grid-cols-2 gap-4 mb-4 text-gray-700 outline-none focus:ring-2 focus:ring-gray-300 border rounded-xl px-4 py-3">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="createdAt">Date</option>
            <option value="ai_priority">Priority</option>
          </select>

          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>
        </div>
        
        <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Filter by category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-gray-400 bg-white px-4 py-3 text-sm outline-none transition focus:border-gray-500 text-gray-700"
              >
                <option value="">All categories</option>
                <option value="Bug">Bug</option>
                <option value="Feature Request">Feature Request</option>
                <option value="Improvement">Improvement</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Filter by status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-xl border border-gray-400 bg-white px-4 py-3 text-sm outline-none transition focus:border-gray-500 text-gray-700"
              >
                <option value="">All statuses</option>
                <option value="New">New</option>
                <option value="In Review">In Review</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          {loading ? (
            <div className="rounded-xl bg-gray-50 px-4 py-6 text-sm text-gray-600">
              Loading feedback...
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-sm text-red-700">
              {error}
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-xl bg-gray-50 px-4 py-6 text-sm text-gray-600">
              No feedback found for the selected filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-sm font-semibold text-gray-700">
                      Title
                    </th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-700">
                      Category
                    </th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-700">
                      Sentiment
                    </th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-700">
                      Priority
                    </th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-700">
                      Date
                    </th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-700">
                      Tags
                    </th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-700">
                      AI Summary
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr
                      key={item._id}
                      className="border-b border-gray-100 align-top transition hover:bg-gray-50"
                    >
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">
                        {item.title}
                      </td>

                      <td className="px-4 py-4 text-sm text-gray-700">
                        {item.category}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getSentimentBadgeClass(
                            item.ai_sentiment
                          )}`}
                        >
                          {item.ai_sentiment || "N/A"}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-sm text-gray-700">
                        {item.ai_priority ?? "N/A"}
                      </td>

                      <td className="px-4 py-4">
                        <div className="space-y-2">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClass(
                              item.status
                            )}`}
                          >
                            {item.status}
                          </span>

                          <select
                            value={item.status}
                            onChange={(e) => updateStatus(item._id, e.target.value)}
                            disabled={updatingId === item._id}
                            className="block rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-gray-400 text-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <option value="New">New</option>
                            <option value="In Review">In Review</option>
                            <option value="Resolved">Resolved</option>
                          </select>
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex max-w-xs flex-wrap gap-2">
                          {item.ai_tags && item.ai_tags.length > 0 ? (
                            item.ai_tags.map((tag) => (
                              <span
                                key={`${item._id}-${tag}`}
                                className="rounded-full border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"
                              >
                                {tag}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-gray-500">No tags</span>
                          )}
                        </div>
                      </td>

                      <td className="max-w-sm px-4 py-4 text-sm leading-6 text-gray-600">
                        {item.ai_summary || "No AI summary"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* PAGINATION */}
        <div className="flex justify-center gap-4 mt-6">
          <button onClick={() => setPage((p) => Math.max(p - 1, 1))}>
            Prev
          </button>

          <span>
            Page {page} / {totalPages}
          </span>

          <button onClick={() => setPage((p) => Math.min(p + 1, totalPages))}>
            Next
          </button>
        </div>
      </div>
    </main>
  );
}