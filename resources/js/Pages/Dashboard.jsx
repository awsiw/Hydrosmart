import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useMemo } from 'react';

export default function Dashboard({ simulations = [] }) {
    
    const stats = useMemo(() => {
        let total = simulations.length;
        let privateTotal = simulations.filter(s => s.visibility === 'private').length;
        let panen = 0;
        let mati = 0;
        let hidup = 0;
        let layu = 0;

        simulations.forEach(sim => {
            const phase = sim.latest_log?.plant_phase || 'hidup';
            if (phase === 'panen') panen++;
            else if (phase === 'mati') mati++;
            else if (phase === 'hidup') hidup++;
            else if (phase === 'layu') layu++;
        });

        return { total, privateTotal, panen, mati, hidup, layu };
    }, [simulations]);

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard Overview
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    
                    <div className="mb-6 text-center">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">User Analytics</h3>
                        <div className="w-full flex justify-center">
                            <Link
                                href="/simulations"
                                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-base font-semibold text-white shadow-md transition hover:bg-green-700"
                            >
                                Go to Simulation Workspace
                            </Link>
                        </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3">
                        
                        {/* Simulation Volume Counter */}
                        <div className="flex flex-col justify-between overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100 p-6">
                            <div>
                                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Simulation Volume</h4>
                                <div className="mt-4 text-4xl font-extrabold text-gray-900">{stats.total}</div>
                                <p className="mt-1 text-sm text-gray-500">Total Workspaces Managed</p>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
                                <span className="text-gray-600">Private Workspaces:</span>
                                <span className="font-bold text-gray-800">{stats.privateTotal}</span>
                            </div>
                        </div>

                        {/* Agricultural Outcome Metrics */}
                        <div className="flex flex-col justify-between overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100 p-6">
                            <div>
                                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Agricultural Outcomes</h4>
                                <div className="mt-4 flex items-center gap-4">
                                    <div className="flex-1 rounded-xl bg-green-50 p-4 border border-green-100">
                                        <div className="text-2xl font-bold text-green-700">{stats.panen}</div>
                                        <div className="text-xs font-semibold text-green-600 mt-1">Harvested</div>
                                    </div>
                                    <div className="flex-1 rounded-xl bg-red-50 p-4 border border-red-100">
                                        <div className="text-2xl font-bold text-red-700">{stats.mati}</div>
                                        <div className="text-xs font-semibold text-red-600 mt-1">Terminated</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Active Status Overview */}
                        <div className="flex flex-col justify-between overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100 p-6">
                            <div>
                                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Active Status</h4>
                                <div className="mt-4 flex items-center gap-4">
                                    <div className="flex-1 rounded-xl bg-blue-50 p-4 border border-blue-100">
                                        <div className="text-2xl font-bold text-blue-700">{stats.hidup}</div>
                                        <div className="text-xs font-semibold text-blue-600 mt-1">Healthy</div>
                                    </div>
                                    <div className="flex-1 rounded-xl bg-yellow-50 p-4 border border-yellow-100">
                                        <div className="text-2xl font-bold text-yellow-700">{stats.layu}</div>
                                        <div className="text-xs font-semibold text-yellow-600 mt-1">Stressed</div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
                                Identifies workspaces requiring parameter adjustments.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
