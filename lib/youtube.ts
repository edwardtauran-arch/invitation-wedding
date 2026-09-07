export function extractYoutubeId(urlOrCode: string): string {
  if (!urlOrCode) return "";
  const str = urlOrCode.trim();

  // If it's already an 11 character ID with valid chars
  if (/^[a-zA-Z0-9_-]{11}$/.test(str)) {
    return str;
  }

  // Extract from iframe src attribute if user pasted full <iframe> tag
  const iframeMatch = str.match(/src=["']([^"']+)["']/);
  const targetStr = iframeMatch ? iframeMatch[1] : str;

  // Match youtube video ID (11 chars) from standard URLs (watch, embed, live, short link)
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|live)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = targetStr.match(regExp);

  return match ? match[1] : str;
}
