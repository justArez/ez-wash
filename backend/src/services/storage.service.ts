import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const endpoint = process.env.SUPABASE_S3_ENDPOINT;
const region = process.env.SUPABASE_S3_REGION || "us-east-1";
const accessKeyId = process.env.SUPABASE_S3_ACCESS_KEY_ID;
const secretAccessKey = process.env.SUPABASE_S3_SECRET_ACCESS_KEY;
const bucket = process.env.SUPABASE_STORAGE_BUCKET || "seat-deposits";
// Public project URL used to build the public object link, e.g.
// https://<project-ref>.supabase.co
const publicBaseUrl = process.env.SUPABASE_PUBLIC_URL;
// Optional: Project Settings > API > service_role secret. Only needed to
// auto-create/auto-publicize the bucket on boot; uploads work without it as
// long as the bucket already exists and is public.
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const isPlaceholder = (value?: string) =>
  !value || value.startsWith("REPLACE_WITH_") || value.startsWith("[YOUR_");

export const isStorageConfigured = Boolean(
  !isPlaceholder(endpoint) &&
    !isPlaceholder(accessKeyId) &&
    !isPlaceholder(secretAccessKey) &&
    !isPlaceholder(publicBaseUrl),
);

let bucketEnsured = false;
/**
 * Best-effort: create the bucket (if missing) and mark it public, using the
 * Storage Management REST API. Requires SUPABASE_SERVICE_ROLE_KEY. Runs once
 * per process; failures are logged but never block uploads, since the S3
 * PutObject call works regardless of the bucket's public flag.
 */
async function ensureBucketIsPublic(): Promise<void> {
  if (bucketEnsured || !serviceRoleKey || isPlaceholder(publicBaseUrl)) return;
  bucketEnsured = true;

  const headers = {
    Authorization: `Bearer ${serviceRoleKey}`,
    apikey: serviceRoleKey,
    "Content-Type": "application/json",
  };

  try {
    const getRes = await fetch(
      `${publicBaseUrl}/storage/v1/bucket/${bucket}`,
      { headers },
    );

    if (getRes.status === 404) {
      await fetch(`${publicBaseUrl}/storage/v1/bucket`, {
        method: "POST",
        headers,
        body: JSON.stringify({ id: bucket, name: bucket, public: true }),
      });
      console.log(`Created public storage bucket "${bucket}".`);
      return;
    }

    if (getRes.ok) {
      const info = (await getRes.json()) as { public?: boolean };
      if (!info.public) {
        await fetch(`${publicBaseUrl}/storage/v1/bucket/${bucket}`, {
          method: "PUT",
          headers,
          body: JSON.stringify({ public: true }),
        });
        console.log(`Marked storage bucket "${bucket}" as public.`);
      }
    }
  } catch (err) {
    console.warn(`Could not verify/publicize storage bucket "${bucket}":`, err);
  }
}

let client: S3Client | null = null;
function getClient(): S3Client {
  if (!isStorageConfigured) {
    throw new Error(
      "Supabase S3 storage is not configured on the server. Set SUPABASE_S3_ENDPOINT, SUPABASE_S3_REGION, SUPABASE_S3_ACCESS_KEY_ID, SUPABASE_S3_SECRET_ACCESS_KEY and SUPABASE_PUBLIC_URL.",
    );
  }
  if (!client) {
    client = new S3Client({
      endpoint,
      region,
      credentials: { accessKeyId: accessKeyId!, secretAccessKey: secretAccessKey! },
      forcePathStyle: true,
    });
  }
  return client;
}

/**
 * Upload a file to the Supabase Storage bucket via the S3-compatible API
 * and return its public URL. The bucket must be public (or fronted by a
 * public read policy) for the returned URL to be viewable without auth.
 */
export async function uploadObject(
  key: string,
  body: Uint8Array,
  contentType: string,
): Promise<string> {
  const s3 = getClient();
  await ensureBucketIsPublic();

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );

  return `${publicBaseUrl}/storage/v1/object/public/${bucket}/${key}`;
}
