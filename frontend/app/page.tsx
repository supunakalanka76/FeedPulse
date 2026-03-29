import FeedbackForm from "@/components/feedback/FeedbackForm";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto mb-8 max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          FeedPulse
        </h1>
        <p className="mt-3 text-base text-gray-600">
          An AI-powered product feedback platform for collecting ideas, bugs, and improvement requests.
        </p>
      </div>

      <FeedbackForm />
    </main>
  );
}