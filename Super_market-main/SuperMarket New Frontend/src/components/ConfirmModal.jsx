import React from "react";

export default function ConfirmModal({
  open,
  title = "Confirm",
  message,
  onConfirm,
  onCancel,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  loading = false,
}) {
  // Hooks must be called unconditionally (do not return early before hooks)
  const confirmRef = React.useRef(null);
  React.useEffect(() => {
    // focus the confirm button when modal opens for keyboard users
    if (open) confirmRef.current?.focus();
  }, [open]);
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmModalTitle"
    >
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h3 id="confirmModalTitle" className="text-lg font-semibold mb-2">
          {title}
        </h3>
        {message && <p className="text-sm text-gray-600 mb-4">{message}</p>}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            {loading ? "Please wait..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
