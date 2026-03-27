import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { ImageUploader } from './ImageUploader';
import { useAdminCategories } from '../../hooks/useAdminCategories';
import { uploadProductImage } from '../../api/uploads.api';
import { getAccessToken } from '../../utils/token.utils';
import { generateSlug } from '../../utils/slug.utils';
import type { Product, ProductPayload } from '../../types/product.types';

const productSchema = z
  .object({
    name: z.string().min(3, 'Name must be at least 3 characters'),
    slug: z.string().min(3, 'Slug is required'),
    description: z.string().min(20, 'Description must be at least 20 characters'),
    price: z.coerce.number().gt(0, 'Price must be greater than 0'),
    comparePrice: z.coerce.number().optional(),
    sku: z.string().min(1, 'SKU is required'),
    stock: z.coerce.number().min(0, 'Stock cannot be negative'),
    categoryId: z.string().min(1, 'Category is required'),
    isActive: z.boolean(),
    imageUrls: z
      .array(
        z.string().refine(
          (url) =>
            url.startsWith('data:image/') ||
            url.startsWith('blob:') ||
            url.startsWith('/') ||
            z.string().url().safeParse(url).success,
          'Invalid image URL',
        ),
      )
      .min(1, 'At least one image is required'),
  })
  .superRefine((values, ctx) => {
    if (values.comparePrice && values.comparePrice < values.price) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['comparePrice'],
        message: 'Compare price must be greater than price',
      });
    }
  });

type ProductFormValues = z.input<typeof productSchema>;
type ProductFormOutput = z.output<typeof productSchema>;

interface ProductFormProps {
  mode: 'create' | 'edit';
  initialData?: Product;
  isSubmitting?: boolean;
  onSubmit: (payload: ProductPayload) => Promise<void>;
}

export const ProductForm = ({
  mode,
  initialData,
  isSubmitting = false,
  onSubmit,
}: ProductFormProps) => {
  const { data: categories = [], isLoading: categoriesLoading } = useAdminCategories();
  const [localFiles, setLocalFiles] = useState<File[]>([]);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  const defaultValues = useMemo<ProductFormValues>(
    () => ({
      name: initialData?.name ?? '',
      slug: initialData?.slug ?? '',
      description: initialData?.description ?? '',
      price: initialData?.price ?? 0,
      comparePrice: initialData?.comparePrice,
      sku: initialData?.sku ?? '',
      stock: initialData?.stock ?? 0,
      categoryId: initialData?.categoryId ?? '',
      isActive: initialData?.isActive ?? true,
      imageUrls: initialData?.imageUrls ?? (initialData?.imageUrl ? [initialData.imageUrl] : []),
    }),
    [initialData],
  );

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormValues, unknown, ProductFormOutput>({
    resolver: zodResolver(productSchema),
    defaultValues,
  });

  const watchedName = watch('name');

  useEffect(() => {
    if (!isSlugManuallyEdited) {
      setValue('slug', generateSlug(watchedName));
    }
  }, [watchedName, isSlugManuallyEdited, setValue]);

  const submit = async (values: ProductFormOutput) => {
    try {
      const persistedImageUrls = values.imageUrls
        .map((url) => url.trim())
        .filter((url) => Boolean(url) && !url.startsWith('data:') && !url.startsWith('blob:'));

      const uploadedImageUrls: string[] = [];

      if (localFiles.length > 0) {
        const token = getAccessToken();

        if (!token) {
          throw new Error('You must be logged in as admin to upload product images.');
        }

        const urls = await Promise.all(
          localFiles.map((file) => uploadProductImage(file, token)),
        );

        uploadedImageUrls.push(...urls);
      }

      const finalImageUrls = Array.from(
        new Set([...persistedImageUrls, ...uploadedImageUrls]),
      );

      await onSubmit({
        ...values,
        comparePrice: values.comparePrice || undefined,
        imageUrls: finalImageUrls,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not upload product images');
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5 rounded-2xl bg-white p-6 shadow-sm">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Input label="Name" error={errors.name?.message} {...register('name')} />
        <Input
          label="Slug"
          error={errors.slug?.message}
          {...register('slug')}
          onChange={(event) => {
            setIsSlugManuallyEdited(true);
            setValue('slug', event.target.value);
          }}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-gray-700">Description</label>
        <textarea
          className="w-full rounded-xl border border-gray-300 px-3 py-2"
          rows={4}
          {...register('description')}
        />
        {errors.description ? <p className="text-xs font-medium text-red-500">{errors.description.message}</p> : null}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Input type="number" step="0.01" label="Price" error={errors.price?.message} {...register('price')} />
        <Input
          type="number"
          step="0.01"
          label="Compare Price"
          error={errors.comparePrice?.message}
          {...register('comparePrice')}
        />
        <Input label="SKU" error={errors.sku?.message} {...register('sku')} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Input type="number" label="Stock" error={errors.stock?.message} {...register('stock')} />

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700">Category</label>
          <select className="w-full rounded-xl border border-gray-300 px-3 py-2" {...register('categoryId')}>
            <option value="">{categoriesLoading ? 'Loading...' : 'Select category'}</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.categoryId ? <p className="text-xs font-medium text-red-500">{errors.categoryId.message}</p> : null}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700">Status</label>
          <label className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-3 py-2">
            <input type="checkbox" {...register('isActive')} />
            <span className="text-sm font-semibold text-gray-700">Active</span>
          </label>
        </div>
      </div>

      <Controller
        control={control}
        name="imageUrls"
        render={({ field }) => (
          <ImageUploader
            value={field.value}
            onChange={(urls) => field.onChange(urls)}
            onFilesChange={setLocalFiles}
            maxFiles={5}
            maxSizeMb={2}
            multiple
          />
        )}
      />
      {errors.imageUrls ? <p className="text-xs font-medium text-red-500">{errors.imageUrls.message}</p> : null}

      <div className="flex justify-end">
        <Button type="submit" isLoading={isSubmitting}>
          {mode === 'create' ? 'Create Product' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
};
