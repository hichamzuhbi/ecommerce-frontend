import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Plus, Search, Trash2 } from 'lucide-react';
import { DataTable } from '../../components/admin/DataTable';
import { ConfirmModal } from '../../components/admin/ConfirmModal';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { Button } from '../../components/ui/Button';
import { useAdminProducts, useDeleteProduct } from '../../hooks/useAdminProducts';
import type { Product } from '../../types/product.types';
import { formatPrice } from '../../utils/format.utils';

const stockClass = (stock: number): string => {
  if (stock <= 10) return 'text-red-600';
  if (stock <= 20) return 'text-yellow-600';
  return 'text-green-600';
};

export const AdminProductsPage = () => {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading } = useAdminProducts({ page, limit: 10, search: search || undefined });
  const { mutateAsync: deleteProduct, isPending: isDeleting } = useDeleteProduct();

  const columns = useMemo(
    () => [
      {
        key: 'image',
        header: 'Image',
        render: (product: Product) => (
          <img src={product.imageUrl} alt={product.name} className="h-10 w-10 rounded object-cover" />
        ),
      },
      { key: 'name', header: 'Name', render: (product: Product) => product.name },
      { key: 'sku', header: 'SKU', render: (product: Product) => product.sku ?? '-' },
      { key: 'category', header: 'Category', render: (product: Product) => product.categoryName },
      { key: 'price', header: 'Price', render: (product: Product) => formatPrice(product.price) },
      {
        key: 'stock',
        header: 'Stock',
        render: (product: Product) => (
          <span className={`font-semibold ${stockClass(product.stock)}`}>{product.stock}</span>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        render: (product: Product) => <StatusBadge status={product.isActive ? 'ACTIVE' : 'INACTIVE'} />,
      },
      {
        key: 'actions',
        header: 'Actions',
        render: (product: Product) => (
          <div className="flex items-center gap-2">
            <Link to={`/admin/products/${product.id}/edit`} className="rounded-lg p-2 text-indigo-600 hover:bg-indigo-50">
              <Edit size={16} />
            </Link>
            <button
              type="button"
              onClick={() => setDeleteId(product.id)}
              className="rounded-lg p-2 text-red-600 hover:bg-red-50"
              aria-label={`Delete ${product.name}`}
              title={`Delete ${product.name}`}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ),
      },
    ],
    [],
  );

  const onDeleteConfirm = async () => {
    if (!deleteId) return;
    await deleteProduct(deleteId);
    setDeleteId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Products</h1>
          <p className="text-sm font-medium text-gray-600">Total: {data?.meta.total ?? 0}</p>
        </div>

        <div className="flex gap-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              className="rounded-xl border border-gray-300 py-2 pl-8 pr-3 text-sm"
              placeholder="Search products"
            />
          </div>
          <Link to="/admin/products/new">
            <Button>
              <Plus size={14} className="mr-1 inline" /> Add Product
            </Button>
          </Link>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        page={page}
        totalPages={data?.meta.totalPages ?? 1}
        onPageChange={setPage}
        rowKey={(product) => product.id}
      />

      <ConfirmModal
        open={Boolean(deleteId)}
        title="Delete product"
        description="This action cannot be undone. Are you sure you want to delete this product?"
        isLoading={isDeleting}
        onClose={() => setDeleteId(null)}
        onConfirm={() => void onDeleteConfirm()}
      />
    </div>
  );
};
