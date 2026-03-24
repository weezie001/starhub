import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog.jsx";
import { Button } from "./button.jsx";

export default function ConfirmModal({ open, title, message, confirmLabel = "Confirm", cancelLabel = "Cancel", variant = "danger", onConfirm, onCancel }) {
  return (
    <Dialog open={open} onOpenChange={o => !o && onCancel()}>
      <DialogContent className="max-w-sm">
        <DialogHeader className="pb-1">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <p className="text-muted-foreground text-sm leading-relaxed">{message}</p>
        <div className="flex gap-3 justify-end pt-2">
          <Button variant="ghost" onClick={onCancel}>{cancelLabel}</Button>
          <Button variant={variant} onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
