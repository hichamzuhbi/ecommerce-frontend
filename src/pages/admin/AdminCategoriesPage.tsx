import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Edit, Trash2 } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ImageUploader } from '../../components/admin/ImageUploader';
import { ConfirmModal } from '../../components/admin/ConfirmModal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import {
  useAdminCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from '../../hooks/useAdminCategories';
import { productsApi } from '../../api/products.api';
import { generateSlug } from '../../utils/slug.utils';
import type { Category } from '../../types/category.types';

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  parentCategoryId: z.string().optional(),
  imageUrls: z.array(z.string().url()).optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

export const AdminCategoriesPage = () => {
  const { data: categories = [], isLoading } = useAdminCategories();
  const { mutateAsync: createCategory, isPending: isCreating } = useCreateCategory();
  const { mutateAsync: updateCategory, isPending: isUpdating } = useUpdateCategory();
  const { mutateAsync: deleteCategory, isPending: isDeleting } = useDeleteCategory();

  const { data: categoryProductCounters } = useQuery({
    queryKey: ['admin-category-product-counts'],
    queryFn: async () => {
      const limit = 100;
      const firstPage = await productsApi.adminList({ page: 1, limit });
      const allProducts = [...firstPage.data];

      for (let page = 2; page <= firstPage.meta.totalPages; page += 1) {
        const nextPage = await productsApi.adminList({ page, limit });
        allProducts.push(...nextPage.data);
      }

      const countById = new Map<string, number>();
      const countByName = new Map<string, number>();

      allProducts.forEach((product) => {
        const categoryId = product.categoryId?.trim();
        const categoryName = product.categoryName?.trim().toLowerCase();

        if (categoryId) {
          countById.set(categoryId, (countById.get(categoryId) ?? 0) + 1);
        }

        if (categoryName) {
          countByName.set(categoryName, (countByName.get(categoryName) ?? 0) + 1);
        }
      });

      return { countById, countByName };
    },
    staleTime: 1000 * 60,
  });

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [slugEdited, setSlugEdited] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      parentCategoryId: '',
      imageUrls: [],
    },
  });

  const watchedName = watch('name');

  useEffect(() => {
    if (!slugEdited) {
      setValue('slug', generateSlug(watchedName));
    }
  }, [watchedName, slugEdited, setValue]);

  const onEdit = (category: Category) => {
    setSelectedCategory(category);
    setSlugEdited(true);
    reset({
      name: category.name,
      slug: category.slug,
      description: category.description ?? '',
      parentCategoryId: category.parentCategoryId ?? '',
      imageUrls: category.imageUrl ? [category.imageUrl] : [],
    });
  };

  const onReset = () => {
    setSelectedCategory(null);
    setSlugEdited(false);
    reset({
      name: '',
      slug: '',
      description: '',
      parentCategoryId: '',
      imageUrls: [],
    });
  };

  const onSubmit = async (values: CategoryFormValues) => {
    const payload = {
      name: values.name,
      slug: values.slug,
      description: values.description,
      parentCategoryId: values.parentCategoryId || undefined,
      imageUrl: values.imageUrls?.[0],
    };

    if (selectedCategory) {
      await updateCategory({ id: selectedCategory.id, payload });
    } else {
      await createCategory(payload);
    }

    onReset();
  };

  const parentOptions = useMemo(
    () => categories.filter((category) => category.id !== selectedCategory?.id),
    [categories, selectedCategory?.id],
  );

  const resolveProductCount = (category: Category): number => {
    const byId = categoryProductCounters?.countById.get(category.id);
    if (typeof byId === 'number') {
      return byId;
    }

    const byName = categoryProductCounters?.countByName.get(category.name.trim().toLowerCase());
    if (typeof byName === 'number') {
      return byName;
    }

    return category.productCount ?? 0;
  };

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.1fr_1fr]">
      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <h1 className="mb-4 text-2xl font-bold tracking-tight text-gray-900">Categories</h1>
        <div className="space-y-2">
          {isLoading
            ? Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-16 animate-pulse rounded-xl bg-gray-100" />
              ))
            : categories.map((category) => (
                <article key={category.id} className="flex items-center justify-between rounded-xl border border-gray-200 p-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={category.imageUrl ?? 'https://placehold.co/48x48'}
                      alt={category.name}
                      className="h-10 w-10 rounded-lg object-cover"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">{category.name}</p>
                      <p className="text-xs font-medium text-gray-500">Products: {resolveProductCount(category)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEdit(category)}
                      className="rounded-lg p-2 text-indigo-600 hover:bg-indigo-50"
                      aria-label={`Edit ${category.name}`}
                      title={`Edit ${category.name}`}
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteId(category.id)}
                      className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                      aria-label={`Delete ${category.name}`}
                      title={`Delete ${category.name}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </article>
              ))}
        </div>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-2xl font-bold tracking-tight text-gray-900">
          {selectedCategory ? 'Edit Category' : 'Add Category'}
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <Input label="Name" error={errors.name?.message} {...register('name')} />
          <Input
            label="Slug"
            error={errors.slug?.message}
            {...register('slug')}
            onChange={(event) => {
              setSlugEdited(true);
              setValue('slug', event.target.value);
            }}
          />

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Description</label>
            <textarea rows={3} className="w-full rounded-xl border border-gray-300 px-3 py-2" {...register('description')} />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Parent Category</label>
            <select className="w-full rounded-xl border border-gray-300 px-3 py-2" {...register('parentCategoryId')}>
              <option value="">None</option>
              {parentOptions.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <Controller
            control={control}
            name="imageUrls"
            render={({ field }) => (
              <ImageUploader
                value={field.value ?? []}
                onChange={(urls) => field.onChange(urls.slice(0, 1))}
                maxFiles={1}
                maxSizeMb={2}
                multiple={false}
              />
            )}
          />

          <div className="flex gap-2">
            <Button type="submit" isLoading={isCreating || isUpdating}>
              {selectedCategory ? 'Update Category' : 'Create Category'}
            </Button>
            {selectedCategory ? (
              <Button type="button" variant="secondary" onClick={onReset}>
                Cancel
              </Button>
            ) : null}
          </div>
        </form>
      </section>

      <ConfirmModal
        open={Boolean(deleteId)}
        title="Delete category"
        description="Deleting this category may affect linked products. Continue?"
        isLoading={isDeleting}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (!deleteId) return;
          void deleteCategory(deleteId).then(() => setDeleteId(null));
        }}
      />
    </div>
  );
};
