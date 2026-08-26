/**
 * Uploads a seat-deposit payment slip through the backend (which holds the
 * Supabase S3 credentials) and persists the resulting URL on the booking in
 * a single request. Never talk to Supabase Storage directly from the
 * browser — S3 secret keys must not be exposed to the client.
 */
import { apiFetch } from "../config/api.config";

export async function uploadDepositImage(
  bookingId: string,
  phone: string,
  file: File,
): Promise<{
  id: string;
  depositImageUrl?: string;
  depositSubmittedAt?: string;
}> {
  const formData = new FormData();
  formData.append("phone", phone);
  formData.append("file", file);

  const response = await apiFetch(
    `/api/bookings/${encodeURIComponent(bookingId)}/deposit/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      json?.error || `Upload failed with status ${response.status}`,
    );
  }

  return json.data;
}
