import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DialogContextType {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DialogContext = React.createContext<DialogContextType | undefined>(undefined);

function useDialog() {
  const context = React.useContext(DialogContext);
  if (!context) {
    throw new Error('Dialog components must be used within a Dialog');
  }
  return context;
}

interface DialogProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

function Dialog({ open: controlledOpen, defaultOpen, onOpenChange, children }: DialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen ?? false);
  const open = controlledOpen ?? uncontrolledOpen;

  const handleOpenChange = React.useCallback(
    (newOpen: boolean) => {
      if (onOpenChange) {
        onOpenChange(newOpen);
      }
      if (controlledOpen === undefined) {
        setUncontrolledOpen(newOpen);
      }
    },
    [controlledOpen, onOpenChange]
  );

  return (
    <DialogContext.Provider value={{ open, onOpenChange: handleOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
}

interface DialogTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const DialogTrigger = React.forwardRef<HTMLButtonElement, DialogTriggerProps>(
  ({ onClick, ...props }, ref) => {
    const { onOpenChange } = useDialog();

    return (
      <button
        ref={ref}
        onClick={(e) => {
          onOpenChange(true);
          onClick?.(e);
        }}
        {...props}
      />
    );
  }
);
DialogTrigger.displayName = 'DialogTrigger';

interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  onClose?: () => void;
}

const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, children, onClose, ...props }, ref) => {
    const { open, onOpenChange } = useDialog();
    const dialogRef = React.useRef<HTMLDialogElement>(null);

    React.useEffect(() => {
      const dialog = dialogRef.current;
      if (!dialog) return;

      if (open) {
        if (!dialog.open) {
          dialog.showModal();
        }
      } else {
        if (dialog.open) {
          dialog.close();
        }
      }
    }, [open]);

    React.useEffect(() => {
      const dialog = dialogRef.current;
      if (!dialog) return;

      const handleClose = () => {
        onOpenChange(false);
        onClose?.();
      };

      const handleCancel = (e: Event) => {
        e.preventDefault();
        onOpenChange(false);
        onClose?.();
      };

      const handleBackdropClick = (e: MouseEvent) => {
        const rect = dialog.getBoundingClientRect();
        const isInDialog =
          rect.top <= e.clientY &&
          e.clientY <= rect.top + rect.height &&
          rect.left <= e.clientX &&
          e.clientX <= rect.left + rect.width;

        if (!isInDialog) {
          onOpenChange(false);
          onClose?.();
        }
      };

      dialog.addEventListener('close', handleClose);
      dialog.addEventListener('cancel', handleCancel);
      dialog.addEventListener('click', handleBackdropClick);

      return () => {
        dialog.removeEventListener('close', handleClose);
        dialog.removeEventListener('cancel', handleCancel);
        dialog.removeEventListener('click', handleBackdropClick);
      };
    }, [onOpenChange, onClose]);

    return (
      <dialog
        ref={dialogRef}
        className="backdrop:bg-black/50 rounded-lg border-0 p-0 shadow-lg"
        aria-modal="true"
      >
        <div
          ref={ref}
          className={cn(
            'relative bg-white rounded-lg shadow-lg w-full max-w-lg p-6 max-h-[85vh] overflow-auto',
            className
          )}
          {...props}
        >
          {children}
          <button
            onClick={() => {
              onOpenChange(false);
              onClose?.();
            }}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </dialog>
    );
  }
);
DialogContent.displayName = 'DialogContent';

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)} {...props} />
);
DialogHeader.displayName = 'DialogHeader';

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)}
    {...props}
  />
);
DialogFooter.displayName = 'DialogFooter';

const DialogTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h2
      ref={ref}
      className={cn('text-lg font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  )
);
DialogTitle.displayName = 'DialogTitle';

const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-sm text-gray-600', className)} {...props} />
));
DialogDescription.displayName = 'DialogDescription';

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
