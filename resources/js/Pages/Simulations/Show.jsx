import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import ConfirmModal from '@/Components/ConfirmModal';

export default function Show({ simulation }) {
    const [activeView, setActiveView] = useState('chatbot');
    const [chatMode, setChatMode] = useState(1); // 1 = Ask, 2 = Smart, 3 = Form
    const [chatInput, setChatInput] = useState('');
    const [formParams, setFormParams] = useState({ ph: '', tds: '', water_temperature: '' });
    const [isTyping, setIsTyping] = useState(false);
    const [selectedDay, setSelectedDay] = useState(1);
    const [deleteModal, setDeleteModal] = useState({ show: false, logId: null });
    const [successModal, setSuccessModal] = useState({ show: false, message: '' });

    // Initial chat history
    const [chatHistory, setChatHistory] = useState(
        simulation?.chat_messages?.length > 0
            ? simulation.chat_messages
            : [{ id: 'sys-1', sender: 'bot', text: "Welcome to the simulation environment. You can monitor the plant's condition on the left panel. How can I assist you today?", mode: 1 }]
    );

    useEffect(() => {
        if (simulation?.chat_messages) {
            setChatHistory(
                simulation.chat_messages.length > 0
                    ? simulation.chat_messages
                    : [{ id: 'sys-1', sender: 'bot', text: "Welcome to the simulation environment. You can monitor the plant's condition on the left panel. How can I assist you today?", mode: 1 }]
            );
        }
    }, [simulation?.chat_messages]);
    // Generate mock days for the timeline tracker
    const timelineDays = Array.from({ length: 30 }, (_, i) => i + 1);

    const calculatePlantState = (targetDay) => {
        let healthPoints = 100;
        let stressDays = 0;
        let phase = 'hidup'; // hidup, layu, mati, panen

        let currentPh = 6.0; // Optimal default
        let currentTds = 600; // Optimal default
        let currentTemp = 22; // Optimal default

        for (let i = 1; i <= targetDay; i++) {
            if (healthPoints <= 0) {
                phase = 'mati';
                continue;
            }

            const log = simulation?.logs?.find(l => parseInt(l.day) === i);
            
            if (log) {
                currentPh = parseFloat(log.ph);
                currentTds = parseFloat(log.tds);
                currentTemp = parseFloat(log.water_temperature);
            }
            
            let isSubOptimal = false;
            let hpChange = 0;

            if (log && log.cluster_index) {
                // ML Model directly affects plant health!
                if (parseInt(log.cluster_index) === 2) {
                    isSubOptimal = true;
                    hpChange = -5; // Stunted Growth (Moderate Damage)
                } else if (parseInt(log.cluster_index) === 3) {
                    isSubOptimal = true;
                    hpChange = -15; // Low Nutrients/Acidic (Heavy Damage)
                } else {
                    isSubOptimal = false;
                    hpChange = 5; // Optimal Growth (Healing)
                }
            } else {
                // Fallback static logic if no ML log yet
                if (currentPh < 5.5 || currentPh > 7.0 || currentTds < 400 || currentTds > 1000 || currentTemp < 15 || currentTemp > 28) {
                    isSubOptimal = true;
                    hpChange = -10;
                } else {
                    isSubOptimal = false;
                    hpChange = 5;
                }
            }

            if (isSubOptimal) {
                stressDays++;
            } else {
                stressDays = 0;
            }

            // Apply HP changes
            healthPoints += hpChange;
            if (healthPoints > 100) healthPoints = 100;

            if (stressDays >= 3) {
                phase = 'layu';
                healthPoints -= 5; // Additional penalty for being wilted
            } else if (phase !== 'mati') {
                phase = 'hidup';
            }

            if (healthPoints <= 0) {
                phase = 'mati';
                healthPoints = 0;
            }
        }

        if (targetDay === 30 && healthPoints > 80 && phase !== 'mati') {
            phase = 'panen';
        }

        return { phase, healthPoints, stressDays };
    };

    const { phase, healthPoints, stressDays } = calculatePlantState(selectedDay);

    return (
        <AuthenticatedLayout>
            <Head title={`Simulation: ${simulation?.title || 'Detail'}`} />

            {/* Main Container - Full height minus default layout margins if necessary, 
                using a flex column to stack header and the split content */}
            <div className="flex h-[calc(100vh-4rem)] flex-col bg-gray-50">
                
                {/* 1. Navigation and Primary Page Split (Header) */}
                <header className="flex shrink-0 items-center border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
                    <Link
                        href="/simulations"
                        className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 transition hover:bg-gray-50"
                    >
                        <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                        Back to Simulation List
                    </Link>
                    <div className="ml-6 flex flex-col">
                        <h1 className="text-lg font-bold text-gray-900">{simulation?.title || 'New Simulation'}</h1>
                        <span className="text-xs text-gray-500">Tracking Progression Dashboard</span>
                    </div>
                </header>

                {/* 2 & 3. Two-Column Viewport Split */}
                <div className="flex flex-1 overflow-hidden">
                    
                    {/* Left Column: Image Area */}
                    <div className="flex w-1/2 flex-col border-r border-gray-200 bg-gray-100">
                        {/* Upper Section: Visualization Workspace */}
                        <div className="relative flex flex-1 items-center justify-center overflow-hidden p-6 bg-gray-200">
                            <img 
                                src={`/image/${phase}.jpeg`} 
                                alt={`Plant State: ${phase}`} 
                                className="max-h-full max-w-full object-contain rounded-2xl shadow-sm"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                                }}
                            />
                            <div className="hidden h-full w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-400 bg-white/50 text-gray-500">
                                <svg className="mb-4 h-16 w-16 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 3h18M3 3v18" />
                                </svg>
                                <span className="font-medium">Image file missing</span>
                                <span className="text-sm">Please ensure /image/{phase}.jpeg exists.</span>
                            </div>
                            
                            <div className="absolute top-8 left-8 bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-md border border-white">
                                <div className="text-[10px] font-pixel text-gray-800 capitalize leading-relaxed">Status: {phase}</div>
                                <div className="text-[10px] font-pixel text-gray-600 mt-2 leading-relaxed">Health: {healthPoints}%</div>
                                <div className="text-[10px] font-pixel text-gray-600 mt-1 leading-relaxed">Stress: {stressDays} d</div>
                            </div>
                        </div>

                        {/* Bottom Section: Horizontal Timeline Tracker */}
                        <div className="shrink-0 border-t border-gray-300 bg-white px-4 py-3 shadow-inner">
                            <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">Simulation Timeline</h3>
                            <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 custom-scrollbar">
                                {timelineDays.map((day) => (
                                    <div 
                                        key={day} 
                                        onClick={() => setSelectedDay(day)}
                                        className={`flex snap-start shrink-0 cursor-pointer flex-col items-center justify-center rounded-lg border px-5 py-3 transition ${selectedDay === day ? 'border-green-500 bg-green-100 shadow-sm' : 'border-gray-200 bg-gray-50 hover:border-green-400 hover:bg-green-50'}`}
                                    >
                                        <span className={`text-xs ${selectedDay === day ? 'text-green-700' : 'text-gray-500'}`}>Day</span>
                                        <span className={`text-lg font-bold ${selectedDay === day ? 'text-green-800' : 'text-gray-700'}`}>{day}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Chatbot Area & Parameter Logs */}
                    <div className="flex w-1/2 flex-col bg-white">
                        {/* Header & Tabs */}
                        <div className="border-b border-gray-100 bg-gray-50 px-6 py-4 shadow-sm flex items-center justify-between">
                            <div>
                                <h2 className="text-base font-semibold text-gray-800">Workspace Data & Assistant</h2>
                                <p className="text-xs text-gray-500">Manage logs or ask the assistant.</p>
                            </div>
                            <div className="flex rounded-lg bg-gray-200 p-1">
                                <button
                                    onClick={() => setActiveView('chatbot')}
                                    className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${activeView === 'chatbot' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Chatbot
                                </button>
                                <button
                                    onClick={() => setActiveView('list')}
                                    className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${activeView === 'list' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Parameter Logs
                                </button>
                            </div>
                        </div>

                        {activeView === 'chatbot' ? (
                            <>
                                {/* Chat Mode Selector */}
                                <div className="border-b border-gray-100 bg-white px-6 py-2 flex items-center justify-between text-sm">
                                    <span className="font-semibold text-gray-700">Chat Mode:</span>
                                    <div className="flex gap-2">
                                        <button onClick={() => setChatMode(1)} className={`px-3 py-1 rounded-full font-medium transition ${chatMode === 1 ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Ask Mode</button>
                                        <button onClick={() => setChatMode(2)} className={`px-3 py-1 rounded-full font-medium transition ${chatMode === 2 ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Smart Mode</button>
                                        <button onClick={() => setChatMode(3)} className={`px-3 py-1 rounded-full font-medium transition ${chatMode === 3 ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Form Mode</button>
                                    </div>
                                </div>

                                {/* Chat Log Workspace */}
                                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                    {chatHistory.map((msg) => {
                                        let bgClass, textClass, bubbleClass;
                                        if (msg.mode === 1) {
                                            bgClass = 'bg-amber-100'; textClass = 'text-amber-600'; bubbleClass = msg.sender === 'user' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-900 border border-amber-200';
                                        } else if (msg.mode === 3) {
                                            bgClass = 'bg-blue-100'; textClass = 'text-blue-600'; bubbleClass = msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-900 border border-blue-200';
                                        } else {
                                            bgClass = 'bg-green-100'; textClass = 'text-green-600'; bubbleClass = msg.sender === 'user' ? 'bg-green-600 text-white' : 'bg-green-50 text-green-900 border border-green-200';
                                        }

                                        return (
                                            <div key={msg.id} className={`flex gap-4 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                                                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${bgClass} ${textClass}`}>
                                                    {msg.sender === 'user' ? (
                                                        <span className="font-bold text-xs">U</span>
                                                    ) : (
                                                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <div className={`rounded-2xl px-4 py-3 text-sm max-w-[80%] ${msg.sender === 'user' ? 'rounded-tr-none' : 'rounded-tl-none'} ${bubbleClass}`}>
                                                    {msg.text}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {isTyping && (
                                        <div className="flex gap-4">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-500">...</div>
                                        </div>
                                    )}
                                </div>

                                {/* Chat Input Area */}
                                <div className="border-t border-gray-200 bg-white p-4">
                                    {chatMode === 3 ? (
                                        <div className="flex flex-col gap-2 rounded-xl border border-blue-300 bg-blue-50 p-4 shadow-sm">
                                            <div className="flex justify-between items-center mb-1">
                                                <p className="text-xs font-semibold text-blue-800 uppercase tracking-wider">Direct Data Entry (Form Mode)</p>
                                                <span className="bg-blue-200 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Target: Day {selectedDay}</span>
                                            </div>
                                            <div className="flex gap-3">
                                                <input type="number" min="0" step="any" placeholder="pH" value={formParams.ph} onChange={e => setFormParams({...formParams, ph: e.target.value.replace(/[^0-9.]/g, '')})} className="w-1/3 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                                                <input type="number" min="0" step="any" placeholder="TDS" value={formParams.tds} onChange={e => setFormParams({...formParams, tds: e.target.value.replace(/[^0-9.]/g, '')})} className="w-1/3 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                                                <input type="number" min="0" step="any" placeholder="Temp (°C)" value={formParams.water_temperature} onChange={e => setFormParams({...formParams, water_temperature: e.target.value.replace(/[^0-9.]/g, '')})} className="w-1/3 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                                            </div>
                                            <button 
                                                onClick={async () => {
                                                    if (!formParams.ph || !formParams.tds || !formParams.water_temperature) return;
                                                    const msgText = `Input Form: Day ${selectedDay}, pH ${formParams.ph}, TDS ${formParams.tds}, Temp ${formParams.water_temperature}`;
                                                    setChatHistory(prev => [...prev, { id: Date.now(), sender: 'user', text: msgText, mode: 3 }]);
                                                    
                                                    try {
                                                        const response = await axios.post(`/simulations/${simulation.title}/logs`, { ...formParams, day: selectedDay, mode: 3, message: msgText });
                                                        setFormParams({ ph: '', tds: '', water_temperature: '' });
                                                        if (response.data.reply) {
                                                            setChatHistory(prev => [...prev, { id: Date.now()+1, sender: 'bot', text: response.data.reply, mode: 3 }]);
                                                        }
                                                        setSuccessModal({ show: true, message: 'Success: Parameter log has been securely saved!' });
                                                        router.reload({ only: ['simulation'] }); // Reload list view and chat history
                                                    } catch (e) {
                                                        setChatHistory(prev => [...prev, { id: Date.now()+1, sender: 'bot', text: 'Error: Failed to save parameters.', mode: 3 }]);
                                                    }
                                                }}
                                                className="mt-2 flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                                            >
                                                Apply Parameters
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3 rounded-full border border-gray-300 bg-gray-50 px-4 py-2 shadow-sm focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500">
                                            <input 
                                                type="text" 
                                                value={chatInput}
                                                onChange={(e) => setChatInput(e.target.value)}
                                                onKeyDown={async (e) => {
                                                    if (e.key === 'Enter' && chatInput.trim()) {
                                                        const currentMode = chatMode;
                                                        const userText = chatInput.trim();
                                                        setChatInput('');
                                                        setChatHistory(prev => [...prev, { id: Date.now(), sender: 'user', text: userText, mode: currentMode }]);
                                                        setIsTyping(true);
                                                        
                                                        try {
                                                            const res = await axios.post(`/simulations/${simulation.title}/chat`, { message: userText, mode: currentMode, day: selectedDay });
                                                            setChatHistory(prev => [...prev, { id: Date.now()+1, sender: 'bot', text: res.data.reply, mode: currentMode }]);
                                                            if (res.data.status === 'simulation_ran') {
                                                                router.reload({ only: ['simulation'] }); // Reload list view data
                                                            }
                                                        } catch (err) {
                                                            setChatHistory(prev => [...prev, { id: Date.now()+1, sender: 'bot', text: 'System Error: Could not connect to the assistant.', mode: currentMode }]);
                                                        } finally {
                                                            setIsTyping(false);
                                                        }
                                                    }
                                                }}
                                                placeholder="Type a message to the assistant..." 
                                                className="w-full border-none bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-0"
                                            />
                                            <button 
                                                onClick={async () => {
                                                    if (!chatInput.trim()) return;
                                                    const currentMode = chatMode;
                                                    const userText = chatInput.trim();
                                                    setChatInput('');
                                                    setChatHistory(prev => [...prev, { id: Date.now(), sender: 'user', text: userText, mode: currentMode }]);
                                                    setIsTyping(true);
                                                    
                                                    try {
                                                        const res = await axios.post(`/simulations/${simulation.title}/chat`, { message: userText, mode: currentMode, day: selectedDay });
                                                        setChatHistory(prev => [...prev, { id: Date.now()+1, sender: 'bot', text: res.data.reply, mode: currentMode }]);
                                                        if (res.data.status === 'simulation_ran') {
                                                            router.reload({ only: ['simulation'] }); // Reload list view data
                                                        }
                                                    } catch (err) {
                                                        setChatHistory(prev => [...prev, { id: Date.now()+1, sender: 'bot', text: 'System Error: Could not connect to the assistant.', mode: currentMode }]);
                                                    } finally {
                                                        setIsTyping(false);
                                                    }
                                                }}
                                                className="flex shrink-0 items-center justify-center rounded-full bg-green-600 p-2 text-white transition hover:bg-green-700"
                                            >
                                                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                                                </svg>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col p-6 overflow-hidden">
                                <div className="mb-2">
                                    <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                        Active State: Day {selectedDay}
                                    </span>
                                </div>
                                <div className="mb-4 flex items-center justify-between shrink-0">
                                    <h3 className="text-sm font-bold text-gray-800">Simulation Variables Log</h3>
                                    <button 
                                        onClick={() => {
                                            setActiveView('chatbot');
                                            setChatMode(3);
                                        }}
                                        className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-green-700"
                                    >
                                        + Add Row
                                    </button>
                                </div>
                                <div className="flex-1 overflow-auto border border-gray-200 rounded-lg bg-white">
                                    <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 font-semibold text-gray-600">ID</th>
                                                <th className="px-4 py-3 font-semibold text-gray-600">Day</th>
                                                <th className="px-4 py-3 font-semibold text-gray-600">pH</th>
                                                <th className="px-4 py-3 font-semibold text-gray-600">TDS</th>
                                                <th className="px-4 py-3 font-semibold text-gray-600">Temp (°C)</th>
                                                <th className="px-4 py-3 font-semibold text-gray-600 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {simulation?.logs?.length > 0 ? (
                                                simulation.logs.map((log, index) => (
                                                    <tr key={log.id} className="hover:bg-gray-50">
                                                        <td className="px-4 py-3 text-gray-500">#{index + 1}</td>
                                                        <td className="px-4 py-3 font-medium text-gray-800">Day {log.day}</td>
                                                        <td className="px-4 py-3 font-medium text-gray-800">{log.ph}</td>
                                                        <td className="px-4 py-3 font-medium text-gray-800">{log.tds}</td>
                                                        <td className="px-4 py-3 font-medium text-gray-800">{log.water_temperature}</td>
                                                        <td className="px-4 py-3 text-right">
                                                            <button 
                                                                onClick={() => {
                                                                    setFormParams({ ph: log.ph, tds: log.tds, water_temperature: log.water_temperature });
                                                                    setSelectedDay(log.day);
                                                                    setActiveView('chatbot');
                                                                    setChatMode(3);
                                                                }}
                                                                className="text-blue-600 hover:text-blue-800 mr-3 font-medium text-xs"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button 
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    setDeleteModal({ show: true, logId: log.id });
                                                                }}
                                                                className="text-red-600 hover:text-red-800 font-medium text-xs"
                                                            >
                                                                Delete
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                                                        No parameter logs available. Add a new row to start tracking.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
            
            <ConfirmModal
                isOpen={deleteModal.show}
                title="Delete Parameter Log?"
                message="Are you sure you want to permanently delete this parameter log entry?"
                onConfirm={async () => {
                    setDeleteModal({ show: false, logId: null });
                    if (deleteModal.logId) {
                        try {
                            await axios.delete(`/simulations/${simulation.title}/logs/${deleteModal.logId}`);
                            setSuccessModal({ show: true, message: 'Success: Parameter log deleted.' });
                            router.reload({ only: ['simulation'] });
                        } catch(e) {
                            window.alert('Failed to delete log.');
                        }
                    }
                }}
                onCancel={() => setDeleteModal({ show: false, logId: null })}
            />

            <ConfirmModal
                isOpen={successModal.show}
                title="Success"
                message={successModal.message}
                isSuccess={true}
                confirmText="OK"
                onConfirm={() => setSuccessModal({ show: false, message: '' })}
            />

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    height: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f5f9; 
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1; 
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8; 
                }
            `}</style>
        </AuthenticatedLayout>
    );
}
