import type { SyntheticEvent } from 'react';

const rawImageBaseUrl =
  import.meta.env.VITE_API_URL ?? import.meta.env.VITE_API_BASE_URL ?? '';

const normalizedImageBaseUrl = rawImageBaseUrl.replace(/\/+$/, '');

export const IMAGE_FALLBACK_URL = 'https://placehold.co/600x600?text=Image';

export const resolveImageUrl = (value: string): string => {
  const candidate = value.trim();

  if (!candidate) {
    return '';
  }

  if (
    candidate.startsWith('http://') ||
    candidate.startsWith('https://') ||
    candidate.startsWith('blob:') ||
    candidate.startsWith('data:')
  ) {
    return candidate;
  }

  if (!normalizedImageBaseUrl) {
    return candidate;
  }

  if (candidate.startsWith('/')) {
    return `${normalizedImageBaseUrl}${candidate}`;
  }

  return `${normalizedImageBaseUrl}/${candidate}`;
};

export const handleImageError = (
  event: SyntheticEvent<HTMLImageElement, Event>,
): void => {
  const image = event.currentTarget;

  if (image.dataset.fallbackApplied === '1') {
    return;
  }

  image.dataset.fallbackApplied = '1';
  image.src = IMAGE_FALLBACK_URL;
};
