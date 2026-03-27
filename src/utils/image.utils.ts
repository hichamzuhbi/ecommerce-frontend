import type { SyntheticEvent } from 'react';
import { API_ORIGIN } from './api-base.utils';

export const IMAGE_FALLBACK_URL = '/images/product-fallback.svg';

export const resolveImageUrl = (value?: string): string => {
  const candidate = value?.trim() ?? '';

  if (!candidate) {
    return IMAGE_FALLBACK_URL;
  }

  if (
    candidate.startsWith('http://') ||
    candidate.startsWith('https://') ||
    candidate.startsWith('data:') ||
    candidate.startsWith('blob:')
  ) {
    return candidate;
  }

  if (candidate.startsWith('/')) {
    if (!API_ORIGIN) {
      return candidate;
    }

    return `${API_ORIGIN}${candidate}`.replace(/([^:]\/)\/+/g, '$1');
  }

  return candidate;
};

export const handleImageError = (
  event: SyntheticEvent<HTMLImageElement, Event>,
): void => {
  const image = event.currentTarget;
  image.onerror = null;
  image.src = IMAGE_FALLBACK_URL;
};
