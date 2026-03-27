import axios from "axios";
import type { UploadImageResponse } from '../types/api.types';
import { buildAbsoluteApiUrl } from "../utils/api-base.utils";

type UploadEndpointPayload =
  | UploadImageResponse
  | { data?: UploadImageResponse | null }
  | { url?: string; data?: { url?: string } };

const resolveUploadErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const payload = error.response?.data as
      | Record<string, unknown>
      | undefined;

    const rawMessage = payload?.message;
    const rawError = payload?.error;
    const message =
      (typeof rawMessage === 'string' ? rawMessage : undefined) ??
      (typeof rawError === 'string' ? rawError : undefined);

    if (typeof message === "string" && message.trim()) {
      return message;
    }

    if (typeof status === "number") {
      return `Image upload failed with status ${status}.`;
    }

    return "Image upload failed due to a network error.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Image upload failed unexpectedly.";
};

export const uploadProductImage = async (
  file: File,
  token: string,
): Promise<string> => {
  if (!token.trim()) {
    throw new Error("Missing authorization token for image upload.");
  }

  const formData = new FormData();
  formData.append("file", file);

  try {
    const { data } = await axios.post<UploadEndpointPayload>(
      buildAbsoluteApiUrl("/api/uploads/image"),
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const directUrl =
      data && typeof data === 'object' && 'url' in data && typeof data.url === 'string'
        ? data.url
        : undefined;
    const nestedData =
      data && typeof data === 'object' && 'data' in data ? data.data : undefined;
    const nestedUrl =
      nestedData && typeof nestedData === 'object' && 'url' in nestedData
        ? (nestedData.url as string | undefined)
        : undefined;

    const publicUrl = (directUrl ?? nestedUrl)?.trim();

    if (!publicUrl) {
      throw new Error(
        "Upload succeeded but response did not include a public URL.",
      );
    }

    return publicUrl;
  } catch (error) {
    throw new Error(resolveUploadErrorMessage(error));
  }
};
