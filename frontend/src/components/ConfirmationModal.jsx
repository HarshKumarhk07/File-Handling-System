import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { FaExclamationTriangle, FaSignOutAlt, FaTrash, FaUserSlash } from 'react-icons/fa';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, type = 'delete' }) => {
    const config = {
        delete: {
            icon: FaTrash,
            color: 'text-red-400',
            bg: 'bg-red-500/20',
            button: 'bg-gradient-to-r from-red-600 to-red-500 shadow-red-500/20',
            buttonText: 'Delete'
        },
        revoke: {
            icon: FaUserSlash,
            color: 'text-orange-400',
            bg: 'bg-orange-500/20',
            button: 'bg-gradient-to-r from-orange-600 to-orange-500 shadow-orange-500/20',
            buttonText: 'Revoke Access'
        },
        logout: {
            icon: FaSignOutAlt,
            color: 'text-gray-300',
            bg: 'bg-gray-500/20',
            button: 'bg-gradient-to-r from-gray-600 to-gray-500 shadow-gray-500/20',
            buttonText: 'Sign Out'
        }
    };

    const style = config[type] || config.delete;
    const Icon = style.icon;

    // Use createPortal to render at document body level
    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        onClick={(e) => e.stopPropagation()}
                        className="glass-panel w-full max-w-md p-6 rounded-2xl border border-white/10 shadow-2xl relative"
                    >
                        <div className="flex gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${style.bg} ${style.color}`}>
                                <Icon size={20} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                                <p className="text-gray-300 text-sm leading-relaxed mb-6">
                                    {message}
                                </p>
                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={async (e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            try {
                                                await onConfirm();
                                            } catch (err) {
                                                console.error("Confirmation action failed", err);
                                            } finally {
                                                onClose();
                                            }
                                        }}
                                        className={`px-4 py-2 rounded-lg text-sm font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95 ${style.button}`}
                                    >
                                        {style.buttonText}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default ConfirmationModal;
