import { motion } from 'framer-motion';
import { FaExclamationTriangle, FaFolderOpen, FaLock, FaWifi } from 'react-icons/fa';

// Animation variants
const fadeIn = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

// 1. Generic Empty State
export const EmptyState = ({
    title = "No items found",
    message = "There are no items to display at this moment.",
    actionLabel,
    onAction
}) => {
    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="flex flex-col items-center justify-center py-16 px-4 text-center"
        >
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                <FaFolderOpen className="text-4xl text-gray-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-gray-400 max-w-sm mb-6">{message}</p>
            {actionLabel && onAction && (
                <button onClick={onAction} className="btn-primary px-6 py-2 rounded-xl">
                    {actionLabel}
                </button>
            )}
        </motion.div>
    );
};

// 2. Error State (Network or API errors)
export const ErrorState = ({ message = "Something went wrong", onRetry }) => {
    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="w-full p-6 rounded-2xl bg-red-500/10 border border-red-500/20 flex flex-col items-center text-center"
        >
            <FaWifi className="text-4xl text-red-400 mb-4 opacity-80" />
            <h3 className="text-lg font-bold text-red-200 mb-2">Connection Error</h3>
            <p className="text-red-300/70 mb-6 max-w-sm">{message}</p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-lg transition-colors border border-red-500/30 font-medium"
                >
                    Try Again
                </button>
            )}
        </motion.div>
    );
};

// 3. Unauthorized State (403)
export const UnauthorizedState = () => {
    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4"
        >
            <div className="w-24 h-24 bg-yellow-500/10 rounded-full flex items-center justify-center mb-6 border border-yellow-500/20 animate-pulse">
                <FaLock className="text-5xl text-yellow-500" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">Access Denied</h1>
            <p className="text-gray-400 max-w-md mb-8">
                You don't have permission to view this page. Please contact your administrator if you believe this is an error.
            </p>
        </motion.div>
    );
};

// 4. Loading Overlay (Global Spinner)
export const LoadingOverlay = ({ message = "Loading..." }) => {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
            <p className="text-emerald-500 font-medium tracking-wider animate-pulse">{message}</p>
        </div>
    );
};
