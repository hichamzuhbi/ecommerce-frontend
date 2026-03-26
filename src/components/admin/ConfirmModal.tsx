import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmModal = ({
  open,
  title,
  description,
  isLoading = false,
  onConfirm,
  onClose,
}: ConfirmModalProps) => {
  return (
    <Modal open={open} title={title} onClose={onClose}>
      <p className="text-sm font-medium text-gray-600">{description}</p>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} isLoading={isLoading}>
          Confirm
        </Button>
      </div>
    </Modal>
  );
};
