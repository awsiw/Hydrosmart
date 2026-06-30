import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import SimulationCard from '@/Components/SimulationCard';
import { Head, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';

// ─── Modal ─────────────────────────────────────────────────────────────────────
function CreateModal({ onClose, onConfirm }) {
    const [form, setForm] = useState({ title: '', description: '', visibility: 'private' });
    const [errors, setErrors] = useState({});

    const validate = () => {
        const e = {};
        if (!form.title.trim())       e.title       = 'Simulation name is required.';
        if (!form.description.trim()) e.description = 'Description is required.';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleConfirm = () => { if (validate()) onConfirm(form); };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">

                {/* Header Modal */}
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100">
                            <svg className="h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                        </div>
                        <h2 className="text-base font-semibold text-gray-800">Create New Simulation</h2>
                    </div>
                    <button onClick={onClose} className="rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600">
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body Modal */}
                <div className="space-y-4 px-6 py-5">

                    {/* Judul */}
                    <div>
                        <label htmlFor="modal-title" className="mb-1.5 block text-sm font-medium text-gray-700">
                            Simulation Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="modal-title"
                            type="text"
                            placeholder="e.g., Rice Field Irrigation – Dry Season"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            className={`w-full rounded-lg border px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.title ? 'border-red-400' : 'border-gray-300'}`}
                        />
                        {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
                    </div>

                    {/* Deskripsi */}
                    <div>
                        <label htmlFor="modal-description" className="mb-1.5 block text-sm font-medium text-gray-700">
                            Scenario Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            id="modal-description"
                            rows={3}
                            placeholder="Explain the goals and parameters of this simulation..."
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            className={`w-full resize-none rounded-lg border px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.description ? 'border-red-400' : 'border-gray-300'}`}
                        />
                        {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
                    </div>

                    {/* Visibilitas */}
                    <div>
                        <label htmlFor="modal-visibility" className="mb-1.5 block text-sm font-medium text-gray-700">
                            Accessibility
                        </label>
                        <select
                            id="modal-visibility"
                            value={form.visibility}
                            onChange={(e) => setForm({ ...form, visibility: e.target.value })}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-700 shadow-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="private">🔒 Private (only me)</option>
                            <option value="public">🌐 Public (all users)</option>
                        </select>
                    </div>
                </div>

                {/* Footer Modal */}
                <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
                    <button
                        id="modal-cancel"
                        onClick={onClose}
                        className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        id="modal-confirm"
                        onClick={handleConfirm}
                        className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700"
                    >
                        <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Halaman Utama ─────────────────────────────────────────────────────────────
export default function Index({ simulations = [] }) {
    const [search, setSearch]       = useState('');
    const [sortOrder, setSortOrder] = useState('newest');
    const [showModal, setShowModal] = useState(false);

    const filtered = useMemo(() => {
        let data = [...simulations];
        if (search.trim()) {
            const q = search.toLowerCase();
            data = data.filter(
                (s) => s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q),
            );
        }
        data.sort((a, b) => {
            const diff = new Date(b.created_at) - new Date(a.created_at);
            return sortOrder === 'newest' ? diff : -diff;
        });
        return data;
    }, [simulations, search, sortOrder]);

    const handleConfirm = (formData) => {
        setShowModal(false);
        router.post('/simulations', formData, {
            onSuccess: (page) => {
                // Berhasil disimpan, Inertia otomatis redirect dari backend jika Controller mengembalikan redirect
            }
        });
    };

    return (
        <AuthenticatedLayout
            navContent={
                <div className="flex flex-1 items-center gap-3 justify-end ml-auto">
                    <div className="relative min-w-0 flex-1 sm:max-w-xs">
                        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
                            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607z" />
                            </svg>
                        </span>
                        <input
                            id="simulation-search"
                            type="text"
                            placeholder="Search simulations..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 bg-white py-1.5 pl-9 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                        />
                    </div>
                    <select
                        id="simulation-sort"
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        className="shrink-0 rounded-lg border border-gray-300 bg-white py-1.5 pl-3 pr-8 text-sm text-gray-700 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                    >
                        <option value="newest">Newest</option>
                        <option value="oldest">Oldest</option>
                    </select>
                    <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500">
                        {filtered.length} simulations
                    </span>
                </div>
            }
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Simulation List
                </h2>
            }
        >
            <Head title="Simulation List" />

            {/* ══════════════════════════════════════════════════
                GRID KARTU
                Tombol Tambah → Kartu 1 → Kartu 2 → Kartu 3
                                Kartu 4 → Kartu 5 → ...
            ══════════════════════════════════════════════════ */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6 max-w-7xl mx-auto pt-8">

                    {/* Elemen pertama: tombol tambah simulasi */}
                    <button
                        id="btn-add-simulation"
                        onClick={() => setShowModal(true)}
                        className="group flex min-h-[260px] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-gray-300 bg-white p-6 text-gray-400 transition-all duration-200 hover:border-green-400 hover:bg-green-50 hover:text-green-600 hover:shadow-md"
                    >
                        <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-gray-300 transition duration-200 group-hover:border-green-400 group-hover:bg-green-100">
                            <svg className="h-7 w-7" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                        </div>
                        <span className="text-sm font-semibold">Add New Simulation</span>
                        <span className="text-center text-xs text-gray-400 group-hover:text-green-500">
                            Design a new agricultural scenario
                        </span>
                    </button>

                    {filtered.map((sim) => (
                        <SimulationCard
                            key={sim.id}
                            id={sim.id}
                            image={sim.image}
                            title={sim.title}
                            description={sim.description}
                            visibility={sim.visibility}
                            user={sim.user}
                        />
                    ))}

                    {/* State kosong */}
                    {filtered.length === 0 && search.trim() && (
                        <div className="col-span-full mt-16 flex flex-col items-center gap-2 text-center">
                            <svg className="h-10 w-10 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607z" />
                            </svg>
                            <p className="text-sm font-medium text-gray-500">No results found for "{search}"</p>
                            <button onClick={() => setSearch('')} className="text-xs font-medium text-green-600 hover:underline">
                                Clear search
                            </button>
                        </div>
                    )}
                </div>

            {/* Modal */}
            {showModal && (
                <CreateModal
                    onClose={() => setShowModal(false)}
                    onConfirm={handleConfirm}
                />
            )}
        </AuthenticatedLayout>
    );
}
