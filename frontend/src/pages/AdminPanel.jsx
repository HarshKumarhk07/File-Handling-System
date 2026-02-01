import { useState, useEffect } from 'react';
import API from '../services/api';
import Navbar from '../components/Navbar';
import { toast } from 'react-toastify';
import { FaTrash, FaUser, FaFile, FaFileAlt, FaExternalLinkAlt } from 'react-icons/fa';
import ConfirmationModal from '../components/ConfirmationModal';

const AdminPanel = () => {
    const [activeTab, setActiveTab] = useState('files');
    const [users, setUsers] = useState([]);
    const [files, setFiles] = useState([]);
    const [stats, setStats] = useState({ totalUsers: 0, totalFiles: 0 });
    const [loading, setLoading] = useState(true);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, fileId: null });

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsRes, usersRes, filesRes] = await Promise.all([
                API.get('/admin/stats'),
                API.get('/admin/users'),
                API.get('/admin/files?limit=50')
            ]);
            setStats(statsRes.data);
            setUsers(usersRes.data);
            setFiles(filesRes.data.files);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch admin data');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateRole = async (userId, newRole) => {
        try {
            await API.put(`/admin/users/${userId}/role`, { role: newRole });
            toast.success(`User ${newRole === 'admin' ? 'promoted' : 'demoted'} successfully`);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update role');
        }
    };

    const confirmDeleteFile = async () => {
        if (!deleteModal.fileId) return;
        try {
            await API.delete(`/admin/files/${deleteModal.fileId}`);
            setFiles(files.filter(f => f._id !== deleteModal.fileId));
            toast.success('File deleted exclusively');
        } catch (error) {
            toast.error('Failed to delete file');
        } finally {
            setDeleteModal({ isOpen: false, fileId: null });
        }
    };

    return (
        <div className="min-h-screen text-white relative">
            <Navbar />

            <div className="container mx-auto p-4 sm:p-6 max-w-7xl">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
                    <div className="text-sm text-emerald-300 bg-emerald-900/20 px-4 py-2 rounded-lg border border-emerald-500/20">
                        System Overview
                    </div>
                </div>

                <div className="flex gap-4 mb-8 border-b border-white/10 pb-1">
                    <button
                        onClick={() => setActiveTab('files')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-t-xl transition-all relative ${activeTab === 'files' ? 'text-emerald-400 bg-white/5 border-b-2 border-emerald-400' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <FaFile /> Files <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full ml-1">{stats.totalFiles}</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-t-xl transition-all relative ${activeTab === 'users' ? 'text-emerald-400 bg-white/5 border-b-2 border-emerald-400' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <FaUser /> Users <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full ml-1">{stats.totalUsers}</span>
                    </button>
                </div>

                <div className="glass-panel overflow-hidden rounded-2xl">
                    {loading ? (
                        <div className="p-6 space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex items-center gap-4 animate-pulse">
                                    <div className="w-10 h-10 bg-white/10 rounded-full" />
                                    <div className="flex-1 h-4 bg-white/10 rounded mb-2" />
                                    <div className="w-20 h-8 bg-white/10 rounded-lg" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/10 bg-black/20">
                                        {activeTab === 'users' ? (
                                            <>
                                                <th className="p-5 text-sm font-semibold text-gray-300">#</th>
                                                <th className="p-5 text-sm font-semibold text-gray-300">Name</th>
                                                <th className="p-5 text-sm font-semibold text-gray-300">Email</th>
                                                <th className="p-5 text-sm font-semibold text-gray-300">Role</th>
                                                <th className="p-5 text-sm font-semibold text-gray-300 text-right">Actions</th>
                                            </>
                                        ) : (
                                            <>
                                                <th className="p-5 text-sm font-semibold text-gray-300">#</th>
                                                <th className="p-5 text-sm font-semibold text-gray-300">File Name</th>
                                                <th className="p-5 text-sm font-semibold text-gray-300">Owner</th>
                                                <th className="p-5 text-sm font-semibold text-gray-300">Size</th>
                                                <th className="p-5 text-sm font-semibold text-gray-300 text-right">Actions</th>
                                            </>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {activeTab === 'users' ? (
                                        users.map((u, index) => (
                                            <tr key={u._id} className="hover:bg-white/5 transition-colors group">
                                                <td className="p-5 text-gray-500 text-sm">{index + 1}</td>
                                                <td className="p-5 font-medium text-white">{u.name}</td>
                                                <td className="p-5 text-gray-400 text-sm">{u.email}</td>
                                                <td className="p-5">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${u.role === 'admin'
                                                        ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                        }`}>
                                                        {u.role.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="p-5 text-right">
                                                    {u.email.toLowerCase() !== 'admin@minidrive.com' && (
                                                        <button
                                                            onClick={() => handleUpdateRole(u._id, u.role === 'admin' ? 'user' : 'admin')}
                                                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 text-gray-300 transition border border-white/5"
                                                        >
                                                            {u.role === 'admin' ? 'Demote' : 'Promote'}
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        files.map((file, index) => (
                                            <tr key={file._id} className="hover:bg-white/5 transition-colors group">
                                                <td className="p-5 text-gray-500 text-sm">{index + 1}</td>
                                                <td className="p-5 font-medium text-white flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center text-teal-400">
                                                        <FaFileAlt />
                                                    </div>
                                                    <span className="truncate max-w-[200px]">{file.originalName}</span>
                                                </td>
                                                <td className="p-5 text-gray-400 text-sm text-emerald-300">{file.owner?.email || 'Unknown'}</td>
                                                <td className="p-5 text-gray-500 text-sm font-mono text-xs">
                                                    {file.size >= 1024 * 1024 ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : `${(file.size / 1024).toFixed(1)} KB`}
                                                </td>
                                                <td className="p-5 text-right flex justify-end gap-2">
                                                    <a
                                                        href={file.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition"
                                                        title="View"
                                                    >
                                                        <FaExternalLinkAlt size={14} />
                                                    </a>
                                                    <button
                                                        onClick={() => setDeleteModal({ isOpen: true, fileId: file._id })}
                                                        className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
                                                        title="Delete"
                                                    >
                                                        <FaTrash size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, fileId: null })}
                onConfirm={confirmDeleteFile}
                title="Delete File?"
                message="This will permanently delete this file and remove access for all shared users."
                type="delete"
            />
        </div>
    );
};

export default AdminPanel;
