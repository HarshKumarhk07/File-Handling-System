import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const validateEmail = (email) => {
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!re.test(email)) return false;
        // Reject common invalid TLD typos (.comm, .cpm, .con, etc.)
        const invalidTlds = ['comm', 'cpm', 'con', 'cim', 'vom', 'coom', 'colm', 'comn', 'xom', 'orgg', 'nnet', 'nett'];
        const tld = email.split('.').pop()?.toLowerCase() || '';
        return !invalidTlds.includes(tld);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateEmail(email)) {
            toast.error('Please enter a valid email address');
            return;
        }

        if (password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        try {
            await register(name, email, password);
            toast.success('Registration successful!');
            navigate('/');
        } catch (error) {
            const msg = error.response?.status === 429
                ? 'Too many requests. Please wait a few minutes and try again.'
                : (error.response?.data?.message || 'Registration failed');
            toast.error(msg);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen relative overflow-hidden bg-gray-900 px-4">
            {/* Background Elements */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-600 blur-[120px] opacity-20 animate-pulse"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600 blur-[120px] opacity-20 animate-pulse delay-1000"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="glass-panel p-6 sm:p-10 rounded-2xl shadow-2xl w-full max-w-[400px] sm:max-w-md relative z-10"
            >
                <div className="text-center mb-8">
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight">Join Us</h2>
                    <p className="text-gray-400">Create your account today</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-gray-300 mb-2 text-sm font-medium">Full Name</label>
                        <input
                            type="text"
                            className="w-full bg-gray-800/50 border border-gray-600 text-white rounded-xl p-3.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all placeholder-gray-500"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-300 mb-2 text-sm font-medium">Email Address</label>
                        <input
                            type="email"
                            className="w-full bg-gray-800/50 border border-gray-600 text-white rounded-xl p-3.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all placeholder-gray-500"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-300 mb-2 text-sm font-medium">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="w-full bg-gray-800/50 border border-gray-600 text-white rounded-xl p-3.5 pr-12 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all placeholder-gray-500"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition"
                                tabIndex={-1}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                            </button>
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold py-3.5 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg shadow-emerald-500/25"
                    >
                        Sign Up
                    </button>
                </form>
                <p className="text-gray-400 mt-8 text-center text-sm">
                    Already have an account? <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">Sign in</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Register;
