import { motion, AnimatePresence } from 'framer-motion';
import { FaTrash, FaTimes, FaExclamationTriangle } from 'react-icons/fa';

const DeleteModal = ({ isOpen, onClose, onConfirm, fileName, loading }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-gray-900 border border-red-500/20 rounded-2xl p-6 sm:p-8 w-full max-w-sm relative shadow-2xl shadow-red-900/20"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                        disabled={loading}
                    >
                        <FaTimes size={20} />
                    </button>

                    <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                            <FaExclamationTriangle className="text-red-500 text-3xl" />
                        </div>

                        <h3 className="text-2xl font-bold text-white mb-2">Delete File?</h3>
                        <p className="text-gray-400 mb-8">
                            Are you sure you want to delete <span className="text-white font-medium break-all">"{fileName}"</span>? This action cannot be undone.
                        </p>

                        <div className="flex gap-3 w-full">
                            <button
                                onClick={onClose}
                                className="flex-1 px-4 py-3 bg-gray-800 text-gray-300 rounded-xl font-semibold hover:bg-gray-700 transition-colors"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onConfirm}
                                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-500 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-500/20"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <FaTrash size={16} /> Delete
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default DeleteModal;
