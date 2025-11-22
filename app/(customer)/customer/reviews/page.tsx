// app/(customer)/customer/reviews/page.tsx
import ReviewsClient from "./ReviewsClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function ReviewsPage() {
  return <ReviewsClient />;
}
