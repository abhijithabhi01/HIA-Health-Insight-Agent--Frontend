import toast from 'react-hot-toast';

/**
 * Custom confirmation toast
 * @param {string} message - The confirmation message
 * @param {function} onConfirm - Callback when user confirms
 * @param {function} onCancel - Optional callback when user cancels
 */
export const confirmToast = (message, onConfirm, onCancel) => {
  toast(
    (t) => (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-gray-200">{message}</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              if (onCancel) onCancel();
            }}
            className="px-3 py-1.5 text-sm rounded-lg bg-zinc-800 hover:bg-zinc-700 text-gray-200 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              onConfirm();
            }}
            className="px-3 py-1.5 text-sm rounded-lg bg-red-600 hover:bg-red-700 text-white transition"
          >
            Delete
          </button>
        </div>
      </div>
    ),
    {
      duration: Infinity, // Don't auto-dismiss
      style: {
        background: '#18181b',
        color: '#e5e7eb',
        border: '1px solid #27272a',
        minWidth: '300px',
      },
    }
  );
};
