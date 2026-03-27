import { useEffect, useState } from 'react';
import { ImagePlus, Link2, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../ui/Button';
import { handleImageError, IMAGE_FALLBACK_URL, resolveImageUrl } from '../../utils/image.utils';

interface ImageUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
  onFilesChange?: (files: File[]) => void;
  maxFiles?: number;
  maxSizeMb?: number;
  multiple?: boolean;
}

type Tab = 'device' | 'url';

const loadImage = (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve();
    image.onerror = () => reject(new Error('Invalid image URL'));
    image.src = resolveImageUrl(url) || IMAGE_FALLBACK_URL;
  });
};

const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error(`Could not read file ${file.name}`));
    reader.readAsDataURL(file);
  });
};

export const ImageUploader = ({
  value,
  onChange,
  onFilesChange,
  maxFiles = 5,
  maxSizeMb = 2,
  multiple = true,
}: ImageUploaderProps) => {
  const [activeTab, setActiveTab] = useState<Tab>('device');
  const [localFiles, setLocalFiles] = useState<File[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [urlError, setUrlError] = useState('');

  useEffect(() => {
    onFilesChange?.(localFiles);
  }, [localFiles, onFilesChange]);

  const pushUrls = (incoming: string[]) => {
    const next = multiple ? [...value, ...incoming] : incoming.slice(0, 1);
    onChange(next.slice(0, maxFiles));
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;

    const list = Array.from(files);
    const accepted = list.filter((file) => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image`);
        return false;
      }
      if (file.size > maxSizeMb * 1024 * 1024) {
        toast.error(`${file.name} exceeds ${maxSizeMb}MB`);
        return false;
      }
      return true;
    });

    const fileSlotsLeft = Math.max(maxFiles - localFiles.length, 0);
    const acceptedLimited = multiple
      ? accepted.slice(0, fileSlotsLeft)
      : accepted.slice(0, 1);
    const nextFiles = multiple ? [...localFiles, ...acceptedLimited] : acceptedLimited;

    setLocalFiles(nextFiles);

    try {
      const generatedUrls = await Promise.all(
        acceptedLimited.map((file) => fileToDataUrl(file)),
      );
      pushUrls(generatedUrls);
    } catch {
      toast.error('Could not process selected image files');
    }
  };

  const addFromUrl = async () => {
    const candidate = urlInput.trim();
    if (!candidate) return;

    try {
      setUrlError('');
      await loadImage(candidate);
      pushUrls([candidate]);
      setUrlInput('');
    } catch {
      setUrlError('Could not load image from this URL.');
    }
  };

  const removeAt = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4 rounded-2xl border border-gray-200 p-4">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('device')}
          className={`rounded-xl px-3 py-2 text-sm font-semibold ${
            activeTab === 'device' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'
          }`}
        >
          <Upload size={14} className="mr-1 inline" /> Upload from Device
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('url')}
          className={`rounded-xl px-3 py-2 text-sm font-semibold ${
            activeTab === 'url' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'
          }`}
        >
          <Link2 size={14} className="mr-1 inline" /> Add from URL
        </button>
      </div>

      {activeTab === 'device' ? (
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center">
          <ImagePlus size={24} className="text-gray-500" />
          <p className="mt-2 text-sm font-semibold text-gray-700">Drag and drop or click to browse</p>
          <p className="mt-1 text-xs font-medium text-gray-500">
            Max {maxFiles} images, {maxSizeMb}MB each
          </p>
          <input
            type="file"
            multiple={multiple}
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              void handleFiles(event.target.files);
            }}
          />
        </label>
      ) : (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              value={urlInput}
              onChange={(event) => setUrlInput(event.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
            />
            <Button type="button" onClick={() => void addFromUrl()}>
              Add
            </Button>
          </div>
          {urlError ? <p className="text-xs font-medium text-red-500">{urlError}</p> : null}
        </div>
      )}

      <div className="space-y-2">
        <p className="text-sm font-semibold text-gray-700">Final image previews</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {value.map((url, index) => (
            <div key={`${url}-${index}`} className="relative overflow-hidden rounded-xl border border-gray-200">
              <img
                src={resolveImageUrl(url) || IMAGE_FALLBACK_URL}
                alt={`Preview ${index + 1}`}
                className="h-24 w-full object-cover"
                onError={handleImageError}
              />
              <button
                type="button"
                onClick={() => removeAt(index)}
                className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white"
                aria-label="Remove image"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
