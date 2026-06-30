import { Link, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import ConfirmModal from './ConfirmModal';

/**
 * Kartu simulasi berbentuk vertikal (portrait):
 *  ┌─────────────────┐
 *  │   [Gambar/Preview]  │  ← area gambar atas
 *  ├─────────────────┤
 *  │   Judul          │  ← tengah
 *  │   Deskripsi...   │  ← bawah
 *  └─────────────────┘
 */
export default function SimulationCard({ id, latest_log, title, description, visibility, user }) {
    const isPublic = visibility === 'public';
    const bgClass = isPublic ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200';

    const authUser = usePage().props.auth.user;
    const cardUser = user || authUser;

    const phase = latest_log?.plant_phase || 'hidup';
    
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Mendapatkan inisial nama yang sama dengan logic halaman Profile
    const userInitial = (cardUser?.name || 'U')
        .split(' ')
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    const handleDeleteClick = (e) => {
        e.preventDefault();
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        setShowDeleteModal(false);
        router.delete(`/simulations/${encodeURIComponent(title)}`, { preserveScroll: true });
    };

    const handleToggleVisibility = (e) => {
        e.preventDefault();
        router.patch(`/simulations/${encodeURIComponent(title)}/toggle-visibility`, {}, { preserveScroll: true });
    };

    return (
        <Link
            href={`/simulations/${encodeURIComponent(title)}`}
            className={`group flex flex-col overflow-hidden rounded-2xl border shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${bgClass}`}
        >
            {/* ── ATAS: Gambar ── */}
            <div className="relative h-40 w-full shrink-0 overflow-hidden bg-gray-200 flex items-center justify-center">
                <img
                    src={`/image/${phase}.jpeg`}
                    alt={`Plant State: ${phase}`}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    onError={(e) => {
                        e.target.src = '/image/hidup.jpeg'; // safety fallback if file missing
                    }}
                />
                {/* Accessibility Badge (Top Left Corner) */}
                <div 
                    onClick={handleToggleVisibility}
                    className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-semibold shadow-sm z-10 cursor-pointer transition hover:scale-105 hover:shadow-md ${isPublic ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-white/90 text-green-700 hover:bg-white'}`}
                    title="Click to toggle visibility"
                >
                    {isPublic ? 'Public' : 'Private'}
                </div>

                {/* User Profile Avatar (Top Right Corner) */}
                <div className="absolute right-2 top-2 z-10 shrink-0">
                    {cardUser?.profile_photo_url ? (
                        <img 
                            src={cardUser.profile_photo_url} 
                            alt={cardUser.name} 
                            className="h-8 w-8 rounded-full object-cover shadow-md border-2 border-white" 
                        />
                    ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white shadow-md border-2 border-white select-none">
                            {userInitial}
                        </div>
                    )}
                </div>
            </div>

            {/* ── TENGAH: Judul ── */}
            <div className="px-4 pt-4">
                <div className="flex flex-col">
                    <h3 className="text-sm font-semibold leading-snug text-gray-800 line-clamp-2 transition-colors group-hover:text-green-700">
                        {title}
                    </h3>
                    {cardUser?.name && (
                        <p className="mt-0.5 text-[10px] text-gray-500 font-medium">By {cardUser.name}</p>
                    )}
                </div>
            </div>

            {/* ── BAWAH: Deskripsi ── */}
            <div className="flex-1 px-4 pb-4 pt-2">
                <p className="text-xs leading-relaxed text-gray-500 line-clamp-3">
                    {description}
                </p>
            </div>

            {/* Footer */}
            <div className={`flex items-center justify-between border-t px-4 py-2.5 ${isPublic ? 'border-blue-100' : 'border-gray-100'}`}>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 group-hover:text-green-700">
                    Open Simulation
                    <svg
                        className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2.5}
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                </span>
                
                <button
                    onClick={handleDeleteClick}
                    className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition"
                    title="Delete Simulation"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
            
            <ConfirmModal
                isOpen={showDeleteModal}
                title="Delete Simulation?"
                message="Are you sure you want to permanently delete this simulation? This action cannot be undone."
                onConfirm={confirmDelete}
                onCancel={(e) => {
                    e.preventDefault();
                    setShowDeleteModal(false);
                }}
            />
        </Link>
    );
}
