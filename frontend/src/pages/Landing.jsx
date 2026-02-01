import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FaCloudUploadAlt, FaShieldAlt, FaUserShield, FaBolt, FaShareAlt, FaHistory } from 'react-icons/fa';
import { useRef } from 'react';

// Animation Variants
const fadeIn = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2
        }
    }
};

const Landing = () => {
    // Parallax Effect for Hero
    const { scrollY } = useScroll();
    const yHero = useTransform(scrollY, [0, 500], [0, 200]);

    return (
        <div className="min-h-screen relative overflow-hidden text-white selection:bg-emerald-500/30">
            {/*  1️⃣ Navbar  */}
            <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-b-0 rounded-none bg-black/10 backdrop-blur-md">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <Link to="/" className="text-2xl font-bold flex items-center gap-2 tracking-tight">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <FaCloudUploadAlt className="text-white text-lg" />
                        </div>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-white">
                            MiniDrive
                        </span>
                    </Link>
                    <div className="flex gap-4">
                        <Link to="/login" className="px-5 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">
                            Login
                        </Link>
                        <Link to="/register" className="btn-primary px-5 py-2 rounded-lg text-sm shadow-lg shadow-emerald-500/20">
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* 2️⃣ Hero Section */}
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6">
                {/* Background Blobs */}
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-900/40 blur-[120px] animate-pulse" />
                <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-teal-900/30 blur-[120px] animate-pulse delay-700" />

                <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={fadeIn}
                    >
                        <div className="inline-block px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-sm font-medium mb-6">
                            ✨ Redefining Secure Storage
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6 text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400">
                            Secure, Fast & <br />
                            Reliable Storage.
                        </h1>
                        <p className="text-lg text-gray-400 mb-8 max-w-lg leading-relaxed">
                            Upload, manage, and share your files with enterprise-grade encryption and lightning-fast speeds.
                            Experience storage that matters.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link to="/register" className="btn-primary px-8 py-4 rounded-xl text-lg text-center shadow-lg shadow-emerald-500/20">
                                Start
                            </Link>
                        </div>
                    </motion.div>

                    {/* Floating Dashboard Preview */}
                    <motion.div
                        style={{ y: yHero }}
                        initial={{ opacity: 0, scale: 0.9, rotateX: 20 }}
                        animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                        transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                        className="relative hidden lg:block perspective-1000"
                    >
                        <div className="glass-panel p-2 rounded-2xl shadow-2xl shadow-emerald-500/10 border border-white/10 rotate-y-[-5deg] rotate-x-[5deg] transform-preserve-3d">
                            <img
                                src="https://placehold.co/800x500/0f172a/FFF?text=Dashboard+Preview" // Placeholder for now, replace with real screenshot later
                                alt="Dashboard Preview"
                                className="rounded-xl opacity-90"
                            />
                            {/* Floating Badge */}
                            <div className="absolute -left-8 top-20 glass-panel p-4 rounded-xl flex items-center gap-3 animate-bounce shadow-xl">
                                <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                                    <FaShieldAlt />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">Status</p>
                                    <p className="text-sm font-bold text-emerald-400">Encrypted</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* 3️⃣ Features Section */}
            <section className="py-24 bg-black/20">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">Powerful Features</h2>
                        <p className="text-gray-400 max-w-xl mx-auto">Everything you need to manage your digital assets securely.</p>
                    </div>

                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        <FeatureCard icon={<FaShieldAlt />} title="Secure Storage" desc="AES-256 encryption ensures your files remain private and secure." />
                        <FeatureCard icon={<FaBolt />} title="Lightning Fast" desc="Optimized CDN network for instant global uploads and downloads." />
                        <FeatureCard icon={<FaUserShield />} title="Admin Controls" desc="Granular permission settings and audit logs for teams." />
                        <FeatureCard icon={<FaShareAlt />} title="Easy Sharing" desc="Share files securely with expiration links and password protection." />
                        <FeatureCard icon={<FaHistory />} title="History" desc="View your file history and restore previous versions with ease." />
                        <FeatureCard icon={<FaCloudUploadAlt />} title="Bulk Uploads" desc="Drag & drop support for folder upload and management." />
                    </motion.div>
                </div>
            </section>

            {/* 4️⃣ How It Works */}
            <section className="py-24 relative overflow-hidden">
                <div className="container mx-auto px-6">
                    <div className="glass-panel p-12 rounded-3xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px]" />

                        <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
                            <div>
                                <h2 className="text-3xl font-bold mb-6">Start Managing Your Files Smarter</h2>
                                <p className="text-gray-400 mb-8">Join thousands of users who trust MiniDrive for their secure cloud storage needs.</p>
                                <div className="flex gap-4">
                                    <div className="flex-1 glass-card p-6 text-center">
                                        <h3 className="text-4xl font-bold text-teal-400 mb-2">100%</h3>
                                        <p className="text-sm text-gray-500">Secure</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-4">
                                <Step number="01" title="Create Free Account" desc="Sign up in seconds. No credit card required." />
                                <Step number="02" title="Upload Files" desc="Drag and drop your documents, images, and videos." />
                                <Step number="03" title="Access Anywhere" desc="Manage your files from any device, anytime." />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5️⃣ Footer */}
            <footer className="border-t border-white/5 py-12 bg-black/30">
                <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2 opacity-70">
                        <FaCloudUploadAlt className="text-emerald-500" />
                        <span className="font-bold">MiniDrive</span>
                    </div>
                    <div className="flex gap-8 text-sm text-gray-400">
                        <a href="#" className="hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms</a>
                        <a href="#" className="hover:text-white transition-colors">Contact</a>
                        <a href="#" className="hover:text-white transition-colors">GitHub</a>
                    </div>
                    <p className="text-xs text-gray-600">© 2026 MiniDrive Inc.</p>
                </div>
            </footer>
        </div>
    );
};

const FeatureCard = ({ icon, title, desc }) => (
    <motion.div
        variants={fadeIn}
        whileHover={{ y: -5 }}
        className="glass-card p-8 rounded-2xl group border border-white/5 hover:border-emerald-500/30 transition-colors"
    >
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-800 to-black flex items-center justify-center text-2xl text-emerald-400 mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-emerald-900/20">
            {icon}
        </div>
        <h3 className="text-xl font-bold mb-3 group-hover:text-emerald-300 transition-colors">{title}</h3>
        <p className="text-gray-400 leading-relaxed text-sm">{desc}</p>
    </motion.div>
);

const Step = ({ number, title, desc }) => (
    <div className="flex items-center gap-6 p-4 rounded-xl hover:bg-white/5 transition-colors">
        <span className="text-4xl font-bold text-white/10">{number}</span>
        <div>
            <h4 className="font-bold text-white mb-1">{title}</h4>
            <p className="text-sm text-gray-400">{desc}</p>
        </div>
    </div>
);

export default Landing;
