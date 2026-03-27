const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, '');

const trimTrailingApiSegment = (value: string): string =>
  value.replace(/\/api\/?$/i, '');

const rawBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').trim();

export const API_ORIGIN = trimTrailingApiSegment(trimTrailingSlash(rawBaseUrl));

export const buildAbsoluteApiUrl = (path: string): string => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (!API_ORIGIN) {
    return normalizedPath;
  }

  return `${API_ORIGIN}${normalizedPath}`;
};
