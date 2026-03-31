const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, '');

const trimTrailingApiSegment = (value: string): string =>
  value.replace(/\/api\/?$/i, '');

const DEFAULT_API_ORIGIN = 'https://easyshopback-cae6dxddasc5b6gv.westeurope-01.azurewebsites.net';

const rawBaseUrl = (
  import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_ORIGIN
).trim();

export const API_ORIGIN = trimTrailingApiSegment(trimTrailingSlash(rawBaseUrl));

export const buildAbsoluteApiUrl = (path: string): string => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (!API_ORIGIN) {
    return normalizedPath;
  }

  return `${API_ORIGIN}${normalizedPath}`;
};
