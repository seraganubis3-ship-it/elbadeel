/**
 * Converts a file path or partial URL to a full B2 URL
 * Handles both old format (just path) and new format (full URL)
 */
export function getB2ImageUrl(filePath: string | null | undefined): string | null {
  if (!filePath) return null;

  // If already a full URL (http/https), return as is
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }

  // If it's a local path (starts with /), return as is
  if (filePath.startsWith('/')) {
    return filePath;
  }

  // Otherwise, it's a B2 file path that needs to be converted to full URL
  const bucketName = process.env.NEXT_PUBLIC_B2_BUCKET_NAME || 'elbadeel';
  const fullUrl = `https://f005.backblazeb2.com/file/${bucketName}/${filePath}`;

  return fullUrl;
}

/**
 * Check if a source is a valid image URL that can be used with Next Image
 */
export function isValidImageSrc(src: string | null | undefined): src is string {
  if (!src) return false;
  return src.startsWith('/') || src.startsWith('http://') || src.startsWith('https://');
}
