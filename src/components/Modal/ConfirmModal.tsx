import Modal from './Modal';
import Button from '../Button/Button';
import Typography from '../Typography/Typography';
import styles from './ConfirmModal.module.css';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  description,
  confirmLabel = '확인',
  cancelLabel = '취소',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel}>
      <Typography variant="h3">{title}</Typography>
      {description && (
        <Typography variant="body" color="secondary" className={styles.description}>
          {description}
        </Typography>
      )}
      <div className={styles.actions}>
        <Button variant="outline" size="md" className={styles.actionButton} onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button variant="primary" size="md" className={styles.actionButton} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
