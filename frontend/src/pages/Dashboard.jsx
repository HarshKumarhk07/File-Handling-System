import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import API from '../services/api';
import Navbar from '../components/Navbar';
import FileCard from '../components/FileCard';
import UploadModal from '../components/UploadModal';
import ShareModal from '../components/ShareModal';
import PreviewModal from '../components/PreviewModal';
import SkeletonLoader from '../components/SkeletonLoader';
import { FaPlus, FaSearch, FaFolderOpen } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isUploadOpen, setIsUploadOpen] = useState(false);

    // Share Modal State
    const [isShareOpen, setIsShareOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

    // Admin: My Files vs All Files toggle
    const [viewMode, setViewMode] = useState('mine');

    // Preview Modal State
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewFile, setPreviewFile] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        if (user?.token) {
            fetchFiles();
        } else {
            setLoading(false);
            setFiles([]);
        }
    }, [page, user?.token, user?.role, viewMode]);

    const fetchFiles = async () => {
        setLoading(true);
        try {
            const { data } = await API.get(`/files?page=${page}&limit=8`);
            setFiles(data.files ?? []);
            setTotalPages(data.pages ?? 1);
        } catch (error) {
            if (error.response?.status !== 401) {
                toast.error(error.response?.data?.message || 'Failed to load files');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this file?')) return;
        try {
            await API.delete(`/files/${id}`);
            setFiles(prev => (prev ?? []).filter(file => file._id !== id));
            toast.success('File deleted');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete');
        }
    };

    const handleShare = (file) => {
        setSelectedFile(file);
        setIsShareOpen(true);
    };

    const handlePreview = (file) => {
        setPreviewFile(file);
        setIsPreviewOpen(true);
    };

    const filesList = Array.isArray(files) ? files : [];
    const filteredFiles = filesList.filter(file =>
        (file?.originalName ?? '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-900 text-white relative">
            <Navbar user={user} logout={logout} />

            <main className="container mx-auto px-4 py-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        {user?.role === 'admin' && (
                            <div className="flex gap-2 mb-2">
                                <button
                                    onClick={() => setViewMode('mine')}
                                    className={`px-3 py-1 rounded-lg text-sm font-medium transition ${viewMode === 'mine' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400 hover:text-white'}`}
                                >
                                    My Files
                                </button>
                                <button
                                    onClick={() => setViewMode('all')}
                                    className={`px-3 py-1 rounded-lg text-sm font-medium transition ${viewMode === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400 hover:text-white'}`}
                                >
                                    All Files
                                </button>
                            </div>
                        )}
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                            {viewMode === 'all' ? 'All Files' : 'My Files'}
                        </h1>
                        <p className="text-gray-400 text-sm mt-1">Manage your documents securely.</p>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative group w-full md:w-64">
                            <FaSearch className="absolute left-3 top-3.5 text-gray-500 group-focus-within:text-blue-400 transition" />
                            <input
                                type="text"
                                placeholder="Search files..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 text-white pl-10 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsUploadOpen(true)}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-500/30 flex items-center gap-2 whitespace-nowrap hover:shadow-blue-500/50 transition-all"
                        >
                            <FaPlus /> Upload New
                        </motion.button>
                    </div>
                </div>

                {/* Content Section */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => <SkeletonLoader key={i} />)}
                    </div>
                ) : filteredFiles.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <AnimatePresence>
                            {filteredFiles.map(file => (
                                <FileCard
                                    key={file._id}
                                    file={file}
                                    onDelete={handleDelete}
                                    onShare={handleShare}
                                    onPreview={handlePreview}
                                    currentUser={user}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-800/30 border border-gray-700/30 rounded-2xl p-12 text-center"
                    >
                        <div className="bg-gray-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FaFolderOpen size={40} className="text-gray-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-300 mb-2">No files found</h3>
                        <p className="text-gray-500 mb-6">Your workspace is empty. Start by uploading a file.</p>
                        <button onClick={() => setIsUploadOpen(true)} className="text-blue-400 hover:text-blue-300 font-medium">
                            Upload your first file
                        </button>
                    </motion.div>
                )}

                {/* Pagination */}
                {!loading && filteredFiles.length > 0 && (
                    <div className="flex justify-center mt-12 gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(page - 1)}
                            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg disabled:opacity-50 transition"
                        >
                            Previous
                        </button>
                        <span className="px-5 py-2.5 bg-gray-800/50 rounded-xl border border-gray-700/50 text-gray-300 flex items-center">
                            Page <span className="text-white font-bold mx-1">{page}</span> of {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-5 py-2.5 bg-gray-800 rounded-xl hover:bg-gray-750 disabled:opacity-30 disabled:cursor-not-allowed transition-colors border border-gray-700"
                        >
                            Next
                        </button>
                    </div>
                )}
            </main>

            <UploadModal
                isOpen={isUploadOpen}
                onClose={() => setIsUploadOpen(false)}
                onUploadSuccess={() => fetchFiles(1)}
            />

            <ShareModal
                isOpen={isShareOpen}
                onClose={() => { setIsShareOpen(false); setSelectedFile(null); }}
                file={selectedFile}
                onShareSuccess={fetchFiles}
            />

            <PreviewModal
                isOpen={isPreviewOpen}
                onClose={() => { setIsPreviewOpen(false); setPreviewFile(null); }}
                file={previewFile}
            />
        </div >
    );
};

export default Dashboard;
