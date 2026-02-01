import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { FaCloudUploadAlt, FaSignOutAlt } from 'react-icons/fa';
import ConfirmationModal from './ConfirmationModal';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    return (
        <nav className="glass-panel border-x-0 border-t-0 sticky top-0 z-40 bg-black/20 backdrop-blur-md">
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                <Link to="/" className="text-xl font-bold flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                        <FaCloudUploadAlt className="text-white text-lg" />
                    </div>
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-white font-bold tracking-tight">
                        MiniDrive
                    </span>
                </Link>

                <div className="flex items-center gap-6">
                    {user ? (
                        <>
                            <div className="hidden md:flex flex-col items-end">
                                <span className="text-white font-medium text-sm">{user.name}</span>
                                <span className="text-xs text-emerald-400 capitalize">{user.role}</span>
                            </div>

                            {user.role === 'admin' && (
                                <Link to="/admin" className="text-sm bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/20 px-4 py-2 rounded-lg transition-colors">
                                    Admin Panel
                                </Link>
                            )}
                            <button
                                onClick={() => setIsLogoutModalOpen(true)}
                                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                            >
                                <FaSignOutAlt />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </>
                    ) : (
                        <div className="flex gap-4">
                            <Link to="/login" className="text-gray-300 hover:text-white transition-colors">Login</Link>
                            <Link to="/register" className="btn-primary px-4 py-2 rounded-lg text-sm">Register</Link>
                        </div>
                    )}
                </div>
            </div>

            <ConfirmationModal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={logout}
                title="Sign Out?"
                message="Are you sure you want to sign out? You will be redirected to the landing page."
                type="logout"
            />
        </nav>
    );
};

export default Navbar;
