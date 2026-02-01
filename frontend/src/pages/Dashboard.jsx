import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import AuthContext from '../context/AuthContext';
import FileCard from '../components/FileCard';
import Navbar from '../components/Navbar';
import UploadModal from '../components/UploadModal';
import ShareModal from '../components/ShareModal';
import PreviewModal from '../components/PreviewModal';
import ConfirmationModal from '../components/ConfirmationModal';
import { SkeletonCard } from '../components/SkeletonLoader';
import { EmptyState } from '../components/StatusStates';
import { FaPlus, FaSearch, FaFilter } from 'react-icons/fa';
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

    // Delete Modal State
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [fileToDelete, setFileToDelete] = useState(null);

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
            let endpoint = `/files?page=${page}&limit=8`;

            // SECURITY: Only allow admin endpoint if user is actually admin
            if (viewMode === 'all' && user?.role === 'admin') {
                endpoint = `/admin/files?page=${page}&limit=8`;
            }

            const { data } = await API.get(endpoint);

            // Validate response shape
            if (data && Array.isArray(data.files)) {
                setFiles(data.files);
                setTotalPages(data.pages ?? 1);
            } else {
                setFiles([]);
                setTotalPages(1);
            }
        } catch (error) {
            if (error.response?.status !== 401) {
                toast.error(error.response?.data?.message || 'Failed to load files');
            }
            setFiles([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (file) => {
        setFileToDelete(file);
        setIsDeleteOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!fileToDelete) return;
        try {
            await API.delete(`/files/${fileToDelete._id}`);
            setFiles(prev => (prev ?? []).filter(file => file._id !== fileToDelete._id));
            toast.success('File deleted');
            setIsDeleteOpen(false);
            setFileToDelete(null);
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
        <div className="min-h-screen text-white relative">
            <Navbar user={user} logout={logout} />

            <main className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
                    <div className="w-full lg:w-auto">
                        {user?.role === 'admin' && (
                            <div className="flex p-1 bg-black/20 rounded-xl mb-4 w-fit border border-white/5">
                                <button
                                    onClick={() => { setViewMode('mine'); setPage(1); }}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'mine' ? 'bg-emerald-500/20 text-emerald-300 shadow-lg' : 'text-gray-400 hover:text-white'}`}
                                >
                                    My Files
                                </button>
                                <button
                                    onClick={() => { setViewMode('all'); setPage(1); }}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'all' ? 'bg-emerald-500/20 text-emerald-300 shadow-lg' : 'text-gray-400 hover:text-white'}`}
                                >
                                    All Files
                                </button>
                            </div>
                        )}
                        <h1 className="text-4xl font-bold text-white mb-2">
                            {viewMode === 'all' ? 'All Files' : 'My Files'}
                        </h1>
                        <p className="text-gray-400 text-sm">Manage and organize your secure documents.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                        <div className="relative group w-full sm:w-72">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-400 transition" />
                            <input
                                type="text"
                                placeholder="Search files..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="input-glass !pl-16"
                            />
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setIsUploadOpen(true)}
                            className="btn-primary px-6 py-3 rounded-xl flex items-center justify-center gap-2 w-full sm:w-auto shadow-lg shadow-emerald-500/20 whitespace-nowrap"
                        >
                            <FaPlus /> Upload File
                        </motion.button>
                    </div>
                </div>

                {/* Content Section */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                ) : filteredFiles.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        <AnimatePresence mode="popLayout">
                            {filteredFiles.map(file => (
                                <FileCard
                                    key={file._id}
                                    file={file}
                                    onDelete={() => handleDeleteClick(file)}
                                    onShare={handleShare}
                                    onPreview={handlePreview}
                                    currentUser={user}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <EmptyState
                        title="No files found"
                        message={search ? "We couldn't find any files matching your search." : "Your workspace is empty. Upload a file to get started."}
                        actionLabel={!search ? "Upload Now" : "Clear Search"}
                        onAction={!search ? () => setIsUploadOpen(true) : () => setSearch('')}
                    />
                )}

                {/* Pagination */}
                {!loading && filteredFiles.length > 0 && (
                    <div className="flex justify-center mt-12 gap-3">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(page - 1)}
                            className="px-4 py-2 glass-panel hover:bg-white/10 rounded-xl disabled:opacity-50 transition text-sm font-medium"
                        >
                            Previous
                        </button>
                        <span className="px-5 py-2 glass-panel rounded-xl text-sm font-medium flex items-center">
                            Page <span className="text-emerald-400 mx-1 font-bold">{page}</span> of {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-6 py-2 glass-panel hover:bg-white/10 rounded-xl disabled:opacity-50 transition text-sm font-medium"
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

            <ConfirmationModal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete File?"
                message={`Are you sure you want to delete "${fileToDelete?.originalName}"? This action cannot be undone.`}
                type="delete"
            />
        </div>
    );
};

export default Dashboard;
