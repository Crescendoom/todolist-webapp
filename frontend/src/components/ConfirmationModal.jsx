import '/src/styles/ConfirmationModal.css'

function ConfirmationModal({ 
    isOpen, 
    title, 
    message, 
    onConfirm, 
    onCancel, 
    confirmText = "Delete", 
    cancelText = "Cancel",
    confirmButtonClass = "confirm-btn",
    type = "danger"
}) {
    if (!isOpen) return null

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onCancel()
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            onCancel()
        }
    }

    return (
        <div 
            className="modal-backdrop" 
            onClick={handleBackdropClick}
            onKeyDown={handleKeyDown}
            tabIndex={-1}
        >
            <div className="modal-content">
                <div className="modal-header">
                    <h3 className="modal-title">{title}</h3>
                    <button 
                        className="modal-close" 
                        onClick={onCancel}
                        aria-label="Close modal"
                    >
                        ×
                    </button>
                </div>
                
                <div className="modal-body">
                    <p className="modal-message">{message}</p>
                </div>
                
                <div className="modal-footer">
                    <button 
                        className="modal-cancel-btn" 
                        onClick={onCancel}
                        type="button"
                    >
                        {cancelText}
                    </button>
                    <button 
                        className={`modal-confirm-btn ${type}`}
                        onClick={onConfirm}
                        type="button"
                        autoFocus
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ConfirmationModal