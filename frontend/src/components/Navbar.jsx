import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { FaCloudUploadAlt, FaSignOutAlt, FaUserCircle } from 'react-icons/fa';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-gray-900 border-b border-gray-800 text-white p-4">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className="text-xl font-bold flex items-center gap-2">
                    <FaCloudUploadAlt className="text-blue-500" />
                    MiniDrive
                </Link>

                <div className="flex items-center gap-4">
                    {user ? (
                        <>
                            <span className="text-gray-300 hidden md:inline">Welcome, {user.name}</span>
                            {user.role === 'admin' && (
                                <Link to="/admin" className="text-sm bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded">
                                    Admin Panel
                                </Link>
                            )}
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-3 py-1 rounded transition"
                            >
                                <FaSignOutAlt />
                                Logout
                            </button>
                        </>
                    ) : (
                        <div className="flex gap-4">
                            <Link to="/login" className="hover:text-blue-400">Login</Link>
                            <Link to="/register" className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded transition">Register</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
