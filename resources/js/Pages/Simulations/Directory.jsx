import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import SimulationCard from '@/Components/SimulationCard';
import { Head } from '@inertiajs/react';
import { useState, useMemo } from 'react';

export default function Directory({ simulations = [] }) {
    const [search, setSearch]       = useState('');
    const [sortOrder, setSortOrder] = useState('terbaru');

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
                        {filtered.length} public simulations
                    </span>
                </div>
            }
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Public Directory
                </h2>
            }
        >
            <Head title="Public Directory" />

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6 max-w-7xl mx-auto pt-8">
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

                {filtered.length === 0 && (
                    <div className="col-span-full mt-16 flex flex-col items-center gap-2 text-center">
                        <svg className="h-10 w-10 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607z" />
                        </svg>
                        <p className="text-sm font-medium text-gray-500">
                            {search.trim() ? `No results found for "${search}"` : "No public simulations available yet."}
                        </p>
                        {search.trim() && (
                            <button onClick={() => setSearch('')} className="text-xs font-medium text-green-600 hover:underline">
                                Clear search
                            </button>
                        )}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
