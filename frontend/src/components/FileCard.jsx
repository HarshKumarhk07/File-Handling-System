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
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-gray-800/50 backdrop-blur-md border border-gray-700/50 rounded-xl p-4 hover:shadow-xl hover:bg-gray-800/80 transition-all group relative overflow-hidden"
        >
            {/* Shared Indicator Badge */}
            {isSharedWithMe && (
                <div className={`absolute top-0 right-0 px-2 py-1 text-[10px] font-bold uppercase rounded-bl-lg z-10 ${canDelete ? 'bg-green-600/80 text-white' : 'bg-yellow-600/80 text-white'}`}>
                    {canDelete ? <span className="flex items-center gap-1"><FaPen size={8} /> Editor</span> : <span className="flex items-center gap-1"><FaLock size={8} /> Viewer</span>}
                </div>
            )}

            <div className="flex items-center gap-4 mb-3">
                <div className={`p-3 rounded-lg ${file.mimetype?.startsWith('image/') ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                    {file.mimetype?.startsWith('image/') ? <FaImage size={24} /> : <FaFileAlt size={24} />}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium truncate" title={file.originalName}>{file.originalName}</h3>
                    <p className="text-gray-400 text-xs truncate">
                        {isOwner ? 'Me' : `Shared by ${file.owner?.name || 'User'}`} • {file.size >= 1024 * 1024 ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : `${(file.size / 1024).toFixed(2)} KB`}
                    </p>
                </div>
            </div>

            {/* Preview (if image) - Clickable to open full preview */}
            {file.mimetype?.startsWith('image/') && (
                <button
                    onClick={() => onPreview?.(file)}
                    className="h-24 w-full bg-gray-900/50 rounded-lg mb-3 overflow-hidden block w-full text-left focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
                >
                    <img src={file.url} alt={file.originalName} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity cursor-pointer" />
                </button>
            )}

            {/* Preview button for non-images */}
            {!file.mimetype?.startsWith('image/') && onPreview && (
                <button
                    onClick={() => onPreview(file)}
                    className="w-full mb-3 py-2 flex items-center justify-center gap-2 text-sm text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition"
                >
                    <FaEye size={14} /> Preview
                </button>
            )}

            <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-700/50">
                <div className="flex items-center gap-3">
                    {file.mimetype?.startsWith('image/') && (
                        <button
                            onClick={() => onPreview?.(file)}
                            className="text-gray-400 hover:text-blue-400 transition flex items-center gap-1 text-sm"
                        >
                            <FaEye size={14} /> View
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
                        className="text-gray-400 hover:text-blue-400 transition flex items-center gap-1 text-sm disabled:opacity-50"
                    >
                        <FaDownload size={14} /> {downloading ? 'Downloading...' : 'Download'}
                    </button>
                </div>
                <div className="flex gap-2">
                    {/* Share Button (Only Owner) */}
                    {isOwner && (
                        <button
                            onClick={() => onShare(file)}
                            className="bg-indigo-600/20 hover:bg-indigo-600 text-indigo-400 hover:text-white p-2 rounded-lg transition"
                            title="Share"
                        >
                            <FaShareAlt size={14} />
                        </button>
                    )}

                    {/* Delete Button (Owner or Editor) */}
                    {canDelete && (
                        <button
                            onClick={() => onDelete(file._id)}
                            className="bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white p-2 rounded-lg transition"
                            title="Delete"
                        >
                            <FaTrash size={14} />
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default FileCard;
