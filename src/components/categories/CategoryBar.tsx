import type { Category } from '../../types/category.types';

interface CategoryBarProps {
  categories: Category[];
  activeCategoryId?: string;
  onSelectCategory: (categoryId?: string) => void;
}

export const CategoryBar = ({
  categories,
  activeCategoryId,
  onSelectCategory,
}: CategoryBarProps) => {
  return (
    <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-2">
      <button
        onClick={() => onSelectCategory(undefined)}
        className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
          !activeCategoryId
            ? 'bg-indigo-600 text-white'
            : 'bg-white text-gray-700 hover:bg-indigo-50'
        }`}
      >
        All
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelectCategory(category.id)}
          className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
            activeCategoryId === category.id
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-gray-700 hover:bg-indigo-50'
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
};
