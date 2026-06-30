export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel', isSuccess = false }) {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm transition-opacity"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (onCancel) onCancel(e); }}
        >
            <div 
                className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl transform transition-all"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            >
                <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-600 mb-6">{message}</p>
                <div className="flex justify-end gap-3">
                    {onCancel && (
                        <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onCancel(e); }}
                            className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition"
                        >
                            {cancelText}
                        </button>
                    )}
                    <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onConfirm(e); }}
                        className={`rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition ${isSuccess ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
