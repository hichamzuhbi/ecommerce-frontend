import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ProductForm } from '../../components/admin/ProductForm';
import { useCreateProduct } from '../../hooks/useAdminProducts';
import type { ProductPayload } from '../../types/product.types';

export const AdminAddProductPage = () => {
  const navigate = useNavigate();
  const { mutateAsync, isPending } = useCreateProduct();

  const onSubmit = async (payload: ProductPayload, uploads: FormData | null): Promise<void> => {
    await mutateAsync({ payload, uploads });
    toast.success('Product added successfully');
    navigate('/admin/products');
  };

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">Add Product</h1>
      <ProductForm mode="create" isSubmitting={isPending} onSubmit={onSubmit} />
    </div>
  );
};
