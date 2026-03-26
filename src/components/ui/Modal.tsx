import type { PropsWithChildren } from 'react';
import { X } from 'lucide-react';

interface ModalProps extends PropsWithChildren {
  open: boolean;
  title: string;
  onClose: () => void;
}

export const Modal = ({ open, title, children, onClose }: ModalProps) => {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold tracking-tight text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-500 transition-all duration-200 hover:bg-gray-100"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};
