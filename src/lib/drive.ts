export const getDriveEmbedUrl = (url: string): string | null => {
  if (!url) return null;

  const filePatterns = [
    /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,
    /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/,
    /drive\.google\.com\/uc\?(?:export=[a-z]+&)?id=([a-zA-Z0-9_-]+)/,
  ];

  for (const pattern of filePatterns) {
    const match = url.match(pattern);
    if (match?.[1]) {
      return `https://drive.google.com/file/d/${match[1]}/preview`;
    }
  }

  const slidesMatch = url.match(/docs\.google\.com\/presentation\/d\/([a-zA-Z0-9_-]+)/);
  if (slidesMatch?.[1]) {
    return `https://docs.google.com/presentation/d/${slidesMatch[1]}/embed?start=false&loop=false`;
  }

  return null;
};

export const isEmbeddablePdfUrl = (url: string): boolean => /\.pdf(\?.*)?$/i.test(url);
