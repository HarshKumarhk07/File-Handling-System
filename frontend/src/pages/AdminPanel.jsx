import { useState, useEffect } from 'react';
import API from '../services/api';
import Navbar from '../components/Navbar';
import { toast } from 'react-toastify';
import { FaTrash, FaUser, FaFile, FaArrowUp, FaArrowDown } from 'react-icons/fa';

const AdminPanel = () => {
    const [activeTab, setActiveTab] = useState('files');
    const [users, setUsers] = useState([]);
    const [files, setFiles] = useState([]);
    const [stats, setStats] = useState({ totalUsers: 0, totalFiles: 0 });

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
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

    const handleDeleteFile = async (id) => {
        if (!window.confirm('Permanently delete this file? This cannot be undone.')) return;
        try {
            await API.delete(`/admin/files/${id}`);
            setFiles(files.filter(f => f._id !== id));
            toast.success('File deleted exclusively');
        } catch (error) {
            toast.error('Failed to delete file');
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Navbar />

            <div className="container mx-auto p-6">
                <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>

                <div className="flex gap-4 mb-6 border-b border-gray-700 pb-2">
                    <button
                        onClick={() => setActiveTab('files')}
                        className={`flex items-center gap-2 px-4 py-2 rounded transition ${activeTab === 'files' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        <FaFile /> Files ({stats.totalFiles})
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`flex items-center gap-2 px-4 py-2 rounded transition ${activeTab === 'users' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        <FaUser /> Users ({stats.totalUsers})
                    </button>
                </div>

                <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden border border-gray-700">
                    {activeTab === 'users' ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-700 text-gray-300 uppercase text-sm">
                                    <tr>
                                        <th className="p-4">Name</th>
                                        <th className="p-4">Email</th>
                                        <th className="p-4">Role</th>
                                        <th className="p-4">Joined</th>
                                        <th className="p-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {users.map(u => (
                                        <tr key={u._id} className="hover:bg-gray-750">
                                            <td className="p-4">{u.name}</td>
                                            <td className="p-4">{u.email}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-xs ${u.role === 'admin' ? 'bg-purple-900 text-purple-200' : 'bg-gray-600'}`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="p-4 text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                                            <td className="p-4">
                                                {u.role === 'admin' ? (
                                                    <button
                                                        onClick={() => handleUpdateRole(u._id, 'user')}
                                                        className="text-amber-400 hover:text-amber-300 px-2 py-1 rounded text-sm flex items-center gap-1"
                                                        title="Demote to User"
                                                    >
                                                        <FaArrowDown size={12} /> Demote
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleUpdateRole(u._id, 'admin')}
                                                        className="text-emerald-400 hover:text-emerald-300 px-2 py-1 rounded text-sm flex items-center gap-1"
                                                        title="Promote to Admin"
                                                    >
                                                        <FaArrowUp size={12} /> Promote
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-700 text-gray-300 uppercase text-sm">
                                    <tr>
                                        <th className="p-4">File Name</th>
                                        <th className="p-4">Owner</th>
                                        <th className="p-4">Size</th>
                                        <th className="p-4">Type</th>
                                        <th className="p-4">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {files.map(file => (
                                        <tr key={file._id} className="hover:bg-gray-750">
                                            <td className="p-4 truncate max-w-xs">{file.originalName}</td>
                                            <td className="p-4">{file.owner?.email || 'Unknown'}</td>
                                            <td className="p-4 text-sm">{file.size >= 1024 * 1024 ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : `${(file.size / 1024).toFixed(2)} KB`}</td>
                                            <td className="p-4 text-xs text-gray-400">{file.mimetype}</td>
                                            <td className="p-4">
                                                <button
                                                    onClick={() => handleDeleteFile(file._id)}
                                                    className="text-red-400 hover:text-red-300 transition"
                                                    title="Delete"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
