import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaShareAlt, FaUserPlus, FaUserMinus } from 'react-icons/fa';
import API from '../services/api';
import { toast } from 'react-toastify';

import ConfirmationModal from './ConfirmationModal';

const ShareModal = ({ isOpen, onClose, file, onShareSuccess }) => {
    const [email, setEmail] = useState('');
    const [permission, setPermission] = useState('view');
    const [loading, setLoading] = useState(false);
    const [revoking, setRevoking] = useState(null);
    const [revokeUser, setRevokeUser] = useState(null);
    const fileId = file?._id;

    const sharedUsers = file?.sharedWith ?? [];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!fileId) return;
        setLoading(true);
        try {
            await API.post(`/files/${fileId}/share`, { email, permission });
            toast.success(`File shared with ${email}`);
            setEmail('');
            onShareSuccess();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to share file');
        } finally {
            setLoading(false);
        }
    };

    const handleRevokeClick = (userId) => {
        setRevokeUser(userId);
    };

    const executeRevoke = async () => {
        if (!fileId || !revokeUser) return;
        setRevoking(revokeUser);
        try {
            await API.delete(`/files/${fileId}/share/${revokeUser}`);
            toast.success('Access revoked');
            onShareSuccess();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to revoke');
        } finally {
            setRevoking(null);
            setRevokeUser(null);
        }
    };

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
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-gray-800 border border-gray-700 rounded-2xl p-6 w-full max-w-md relative z-10 shadow-2xl"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
                        >
                            <FaTimes size={20} />
                        </button>

                        <div className="text-center mb-6">
                            <div className="bg-blue-600/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-400">
                                <FaUserPlus size={28} />
                            </div>
                            <h3 className="text-2xl font-bold text-white">Share File</h3>
                            <p className="text-gray-400 text-sm">Grant access to another user</p>
                        </div>

                        {/* Shared users list with Revoke */}
                        {sharedUsers.length > 0 && (
                            <div className="mb-6">
                                <label className="block text-gray-300 text-sm font-medium mb-2">Shared with</label>
                                <ul className="space-y-2 max-h-24 overflow-y-auto">
                                    {sharedUsers.map((s) => {
                                        const shareUser = s.user;
                                        const shareUserId = (shareUser?._id ?? shareUser)?.toString?.() ?? String(shareUser);
                                        const email = shareUser?.email ?? 'User';
                                        const name = shareUser?.name ?? email;
                                        return (
                                            <li key={shareUserId} className="flex justify-between items-center bg-gray-900/50 rounded-lg px-3 py-2 text-sm">
                                                <span className="text-white truncate">{name} ({email})</span>
                                                <span className="text-gray-500 text-xs mr-2">{s.permission}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRevokeClick(shareUserId)}
                                                    disabled={revoking === shareUserId}
                                                    className="text-red-400 hover:text-red-300 p-1 rounded disabled:opacity-50"
                                                    title="Revoke access"
                                                >
                                                    <FaUserMinus size={14} />
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-gray-300 text-sm font-medium mb-1">Share with (email)</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="friend@example.com"
                                    className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-300 text-sm font-medium mb-1">Permission</label>
                                <select
                                    value={permission}
                                    onChange={(e) => setPermission(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="view">Can View (Read Only)</option>
                                    <option value="edit">Can Edit (Delete)</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? 'Sharing...' : <><FaShareAlt /> Share Access</>}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
            <ConfirmationModal
                isOpen={!!revokeUser}
                onClose={() => setRevokeUser(null)}
                onConfirm={executeRevoke}
                title="Revoke Access?"
                message={`Are you sure you want to remove access for this user?`}
                type="revoke"
            />
        </AnimatePresence >
    );
};

export default ShareModal;
