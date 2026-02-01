import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

// Base Pulse Animation Component
const Skeleton = ({ className, ...props }) => {
    return (
        <div
            className={cn("animate-pulse bg-white/5 rounded-lg", className)}
            {...props}
        />
    );
};

// 1. File Card Skeleton (for Dashboard)
export const SkeletonCard = () => {
    return (
        <div className="glass-panel p-4 rounded-2xl flex flex-col gap-3">
            <div className="flex justify-between items-start">
                <Skeleton className="w-10 h-10 rounded-lg" /> {/* Icon */}
                <Skeleton className="w-6 h-6 rounded-full" /> {/* Option dots */}
            </div>
            <Skeleton className="w-3/4 h-6 mt-2" /> {/* Title */}
            <Skeleton className="w-1/2 h-4" /> {/* Date */}
            <div className="mt-4 flex justify-between items-center">
                <Skeleton className="w-16 h-5 rounded-full" /> {/* Size badge */}
                <Skeleton className="w-20 h-8 rounded-lg" /> {/* Action Button */}
            </div>
        </div>
    );
};

// 2. Table Row Skeleton (for Admin Panel)
export const SkeletonTableRow = () => {
    return (
        <div className="flex items-center space-x-4 py-4 px-6 border-b border-white/5">
            <Skeleton className="w-10 h-10 rounded-full" /> {/* Avatar */}
            <div className="flex-1 space-y-2">
                <Skeleton className="w-1/4 h-4" />
                <Skeleton className="w-1/3 h-3" />
            </div>
            <Skeleton className="w-20 h-8 rounded-lg" /> {/* Action */}
        </div>
    );
};

// 3. Profile Skeleton
export const SkeletonProfile = () => {
    return (
        <div className="flex items-center gap-4">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="flex flex-col gap-2">
                <Skeleton className="w-32 h-4" />
                <Skeleton className="w-24 h-3" />
            </div>
        </div>
    );
};

export default SkeletonCard; // Default export for backward compatibility with Dashboard
