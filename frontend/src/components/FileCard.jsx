import { useState } from 'react';
import { motion } from 'framer-motion';
import API from '../services/api';
import { FaFileAlt, FaImage, FaTrash, FaDownload, FaShareAlt, FaLock, FaPen, FaEye } from 'react-icons/fa';

const FileCard = ({ file, onDelete, onShare, onPreview, currentUser }) => {
    const [downloading, setDownloading] = useState(false);

    // Normalize IDs for comparison (owner can be populated {_id,name} or raw ObjectId)
    const ownerId = file.owner?._id?.toString?.() ?? file.owner?.toString?.();
    const userId = currentUser?._id?.toString?.() ?? currentUser?.id?.toString?.();
    const isOwner = ownerId && userId && ownerId === userId;

    // Check if shared with me and has edit permission
    const myShare = file.sharedWith?.find(s => {
        const shareUserId = s.user?._id?.toString?.() ?? s.user?.toString?.();
        return shareUserId === userId;
    });
    const isAdmin = currentUser?.role === 'admin';
    const canDelete = isAdmin || isOwner || (myShare && myShare.permission === 'edit');
    const isSharedWithMe = !isOwner;

    return (
        <>
            <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="glass-card p-5 relative flex flex-col h-full hover:border-emerald-500/30 transition-colors"
            >
                {/* Shared Indicator Badge */}
                {isSharedWithMe && (
                    <div className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-bold uppercase rounded-bl-xl z-20 backdrop-blur-md shadow-lg ${canDelete ? 'bg-emerald-500/80 text-white' : 'bg-amber-500/80 text-white'}`}>
                        {canDelete ? <span className="flex items-center gap-1"><FaPen size={8} /> Editor</span> : <span className="flex items-center gap-1"><FaLock size={8} /> Viewer</span>}
                    </div>
                )}

                <div className="flex items-center gap-4 mb-4">
                    <div className={`p-3.5 rounded-xl shadow-inner ${file.mimetype?.startsWith('image/') ? 'bg-teal-500/10 text-teal-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                        {file.mimetype?.startsWith('image/') ? <FaImage size={24} /> : <FaFileAlt size={24} />}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium truncate text-lg" title={file.originalName}>{file.originalName}</h3>
                        <p className="text-gray-400 text-xs truncate flex items-center gap-1">
                            {isOwner ? 'Me' : `Shared by ${file.owner?.name || 'User'}`}
                            <span className="w-1 h-1 rounded-full bg-gray-600 inline-block mx-1"></span>
                            {file.size >= 1024 * 1024 ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : `${(file.size / 1024).toFixed(2)} KB`}
                        </p>
                    </div>
                </div>

                {/* Preview (if image) - Clickable to open full preview */}
                {file.mimetype?.startsWith('image/') && (
                    <div className="flex-grow mb-4">
                        <button
                            onClick={() => onPreview?.(file)}
                            className="w-full h-32 bg-black/20 rounded-xl overflow-hidden block focus:outline-none focus:ring-2 focus:ring-emerald-500/50 border border-white/5 relative hover:border-emerald-500/20 transition-colors"
                        >
                            <img src={file.url} alt={file.originalName} className="w-full h-full object-cover opacity-80 hover:opacity-100 hover:scale-105 transition-all duration-500 cursor-pointer" />
                        </button>
                    </div>
                )}

                {/* PDF Preview - Thumbnail style */}
                {!file.mimetype?.startsWith('image/') && (file.mimetype === 'application/pdf' || file.originalName?.toLowerCase().endsWith('.pdf')) && (
                    <div className="flex-grow mb-4 relative group">
                        <div
                            onClick={() => onPreview?.(file)}
                            className="w-full h-32 bg-white rounded-xl overflow-hidden block border border-white/5 relative hover:border-emerald-500/20 transition-colors cursor-pointer"
                        >
                            <iframe
                                src={`https://docs.google.com/viewer?url=${encodeURIComponent(file.url)}&embedded=true`}
                                className="w-full h-full object-cover pointer-events-none border-0"
                                title="PDF Preview"
                                tabIndex="-1"
                            />
                            {/* Overlay to capture clicks */}
                            <div className="absolute inset-0 bg-transparent" />
                        </div>
                    </div>
                )}

                {/* Preview button for other non-images/non-PDFs */}
                {!file.mimetype?.startsWith('image/') && !(file.mimetype === 'application/pdf' || file.originalName?.toLowerCase().endsWith('.pdf')) && onPreview && (
                    <div className="flex-grow flex items-center justify-center mb-4">
                        <button
                            onClick={() => onPreview(file)}
                            className="w-full py-6 flex flex-col items-center justify-center gap-2 text-sm text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-all group"
                        >
                            <FaEye size={20} className="text-emerald-500 mb-1 group-hover:scale-110 transition-transform" />
                            Quick Preview
                        </button>
                    </div>
                )}

                <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center gap-3">
                    <div className="flex items-center gap-2">
                        {file.mimetype?.startsWith('image/') && (
                            <button
                                onClick={() => onPreview?.(file)}
                                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition"
                                title="View"
                            >
                                <FaEye size={16} />
                            </button>
                        )}
                        <button
                            onClick={async () => {
                                setDownloading(true);
                                try {
                                    const res = await API.get(`/files/${file._id}/download`, {
                                        responseType: 'blob'
                                    });
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
                            className="p-2 text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition disabled:opacity-50"
                            title={downloading ? 'Downloading...' : 'Download'}
                        >
                            {downloading ? <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" /> : <FaDownload size={16} />}
                        </button>
                    </div>

                    <div className="flex gap-2">
                        {/* Share Button (Only Owner) */}
                        {isOwner && (
                            <button
                                onClick={() => onShare(file)}
                                className="p-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white rounded-lg transition shadow-sm"
                                title="Share"
                            >
                                <FaShareAlt size={14} />
                            </button>
                        )}

                        {/* Delete Button (Owner or Editor) - Always Visible */}
                        {canDelete && (
                            <button
                                onClick={() => onDelete(file)}
                                className="p-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-lg transition shadow-sm"
                                title="Delete"
                            >
                                <FaTrash size={14} />
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>
        </>
    );
};

export default FileCard;
