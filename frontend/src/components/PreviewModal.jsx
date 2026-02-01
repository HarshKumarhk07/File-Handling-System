import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaDownload, FaFileAlt } from 'react-icons/fa';
import API from '../services/api';

const PreviewModal = ({ isOpen, onClose, file }) => {
    const [downloading, setDownloading] = useState(false);

    if (!file) return null;

    const isImage = file.mimetype?.startsWith('image/');
    const isPdf = file.mimetype === 'application/pdf' || file.originalName?.toLowerCase().endsWith('.pdf');

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col relative z-10 shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
                            <h3 className="text-white font-medium truncate pr-2" title={file.originalName}>
                                {file.originalName}
                            </h3>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={async () => {
                                        setDownloading(true);
                                        try {
                                            const res = await API.get(`/files/${file._id}/download`, { responseType: 'blob' });
                                            const url = URL.createObjectURL(res.data);
                                            const a = document.createElement('a');
                                            a.href = url;
                                            a.download = file.originalName || 'download';
                                            a.click();
                                            URL.revokeObjectURL(url);
                                        } catch {
                                            window.open(file.url, '_blank');
                                        } finally {
                                            setDownloading(false);
                                        }
                                    }}
                                    disabled={downloading}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-sm transition"
                                >
                                    <FaDownload size={14} /> {downloading ? 'Downloading...' : 'Download'}
                                </button>
                                <button
                                    onClick={onClose}
                                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition"
                                >
                                    <FaTimes size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-auto p-4 flex items-center justify-center min-h-[400px] bg-gray-900/50">
                            {isImage ? (
                                <img
                                    src={file.url}
                                    alt={file.originalName}
                                    className="max-w-full max-h-[70vh] object-contain rounded-lg"
                                />
                            ) : isPdf ? (
                                <iframe
                                    src={`https://docs.google.com/gview?url=${encodeURIComponent(file.url)}&embedded=true`}
                                    title={file.originalName}
                                    className="w-full h-[70vh] min-h-[500px] rounded-lg border-0 bg-white"
                                />
                            ) : (
                                <div className="text-center py-12">
                                    <div className="bg-gray-700 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                        <FaFileAlt size={40} />
                                    </div>
                                    <p className="text-gray-400 mb-4">Preview not available for this file type</p>
                                    <button
                                        onClick={async () => {
                                            setDownloading(true);
                                            try {
                                                const res = await API.get(`/files/${file._id}/download`, { responseType: 'blob' });
                                                const url = URL.createObjectURL(res.data);
                                                const a = document.createElement('a');
                                                a.href = url;
                                                a.download = file.originalName || 'download';
                                                a.click();
                                                URL.revokeObjectURL(url);
                                            } catch {
                                                window.open(file.url, '_blank');
                                            } finally {
                                                setDownloading(false);
                                            }
                                        }}
                                        disabled={downloading}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg transition"
                                    >
                                        <FaDownload /> {downloading ? 'Downloading...' : 'Download to view'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default PreviewModal;
