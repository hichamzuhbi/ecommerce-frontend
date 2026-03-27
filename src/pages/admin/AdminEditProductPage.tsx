import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ProductForm } from '../../components/admin/ProductForm';
import { Spinner } from '../../components/ui/Spinner';
import { useAdminProduct, useUpdateProduct } from '../../hooks/useAdminProducts';
import type { ProductPayload } from '../../types/product.types';

export const AdminEditProductPage = () => {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { data: product, isLoading } = useAdminProduct(id);
  const { mutateAsync, isPending } = useUpdateProduct();

  const onSubmit = async (payload: ProductPayload): Promise<void> => {
    await mutateAsync({ id, payload });
    toast.success('Product updated successfully');
    navigate('/admin/products');
  };

  if (isLoading || !product) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">Edit Product</h1>
      <ProductForm mode="edit" initialData={product} isSubmitting={isPending} onSubmit={onSubmit} />
    </div>
  );
};
