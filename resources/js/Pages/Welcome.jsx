import { Head, Link } from '@inertiajs/react';
import AppLogo from '../../../image/logo11.png';
import WelcomeBg4 from '../../../image/background-welcome4.png';

export default function Welcome({ auth }) {
    return (
        <>
            <Head title="Welcome - HydroSmart" />
            <div className="min-h-screen font-sans text-gray-900 selection:bg-green-500 selection:text-white bg-cover bg-center bg-no-repeat bg-fixed"
                style={{ backgroundImage: `url(${WelcomeBg4})` }}>
                <div className="bg-white/75 min-h-screen backdrop-blur-[1px] flex flex-col justify-between">

                {/* Navbar */}
                <nav className="flex items-center justify-between px-6 py-4 bg-white/40 backdrop-blur-md border-b border-gray-200/50 shadow-sm sm:px-12 lg:px-24">
                    <div className="flex items-center gap-3">
                        <img src={AppLogo} alt="HydroSmart Logo" className="h-10 w-10 object-contain" />
                        <span className="text-sm font-pixel text-gray-800">HydroSmart</span>
                    </div>
                    <div className="flex items-center gap-4">
                        {auth.user ? (
                            <Link
                                href="/dashboard"
                                className="rounded-md px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="rounded-md px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href="/register"
                                    className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </nav>

                {/* Hero Section */}
                <main>
                    <section className="relative flex flex-col items-center justify-center px-6 py-32 text-center sm:px-12 lg:px-24">
                        <div className="relative mx-auto max-w-3xl z-10">
                            <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
                                Welcome
                            </h1>
                            <p className="mb-10 text-lg leading-relaxed text-gray-600 sm:text-xl">
                                IoT-based hydroponic farming management simulation platform. Monitor plant growth and make Machine Learning-driven decisions for optimal results.
                            </p>
                            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                                {auth.user ? (
                                    <Link
                                        href="/simulations"
                                        className="inline-flex w-full items-center justify-center rounded-full bg-green-600 px-8 py-3 text-lg font-semibold text-white shadow-lg transition hover:bg-green-700 hover:shadow-xl sm:w-auto"
                                    >
                                        Open Simulation Workspace
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href="/login"
                                            className="inline-flex w-full items-center justify-center rounded-full bg-green-600 px-8 py-3 text-lg font-semibold text-white shadow-lg transition hover:bg-green-700 hover:shadow-xl sm:w-auto"
                                        >
                                            Get Started
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Web Apa Ini? Section */}
                    <section className="px-6 py-24 sm:px-12 lg:px-24 border-t border-b border-gray-200/20 bg-white/10 backdrop-blur-[1px]">
                        <div className="mx-auto max-w-4xl text-center relative z-10">
                            <h2 className="mb-6 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                                What is this Web App?
                            </h2>
                            <p className="text-lg leading-8 text-gray-600">
                                This is the <strong>IoT-Based Smart Farming Simulation</strong>, an innovative platform specifically designed to track and monitor hydroponic plant growth. This web application utilizes integrated <strong>Machine Learning</strong> models to analyze environmental metrics such as pH, TDS, and water temperature, and automates smart actuator decisions (like nutrient adders and pH reducers) to guide precision farming management.
                            </p>
                        </div>
                    </section>

                    {/* Core Features Grid */}
                    <section className="px-6 py-24 sm:px-12 lg:px-24">
                        <div className="mx-auto max-w-7xl relative z-10">
                            <div className="mb-16 text-center">
                                <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                                    Key Features
                                </h2>
                            </div>
                            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                                {/* Feature 1 */}
                                <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition hover:shadow-md">
                                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-green-100 text-green-600">
                                        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="mb-3 text-lg font-bold text-gray-900">30-Day Historical Timeline</h3>
                                    <p className="text-sm leading-relaxed text-gray-600">
                                        Visual simulation engine tracking step-by-step plant progress from day 1 to the 30-day harvest period.
                                    </p>
                                </div>
                                {/* Feature 2 */}
                                <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition hover:shadow-md">
                                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                                        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 15h17.25M5.625 15v1.5a2.25 2.25 0 002.25 2.25h8.25a2.25 2.25 0 002.25-2.25V15M5.625 7.5v1.5a2.25 2.25 0 002.25 2.25h8.25a2.25 2.25 0 002.25-2.25V7.5M9 7.5h.008v.008H9V7.5zm0 9h.008v.008H9V16.5z" />
                                        </svg>
                                    </div>
                                    <h3 className="mb-3 text-lg font-bold text-gray-900">Interactive Parameter Log</h3>
                                    <p className="text-sm leading-relaxed text-gray-600">
                                        Interactive table log grid for manual entry and tracking of environmental data (pH, TDS, Water Temperature).
                                    </p>
                                </div>
                                {/* Feature 3 */}
                                <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition hover:shadow-md">
                                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                                        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
                                        </svg>
                                    </div>
                                    <h3 className="mb-3 text-lg font-bold text-gray-900">Machine Learning Brain</h3>
                                    <p className="text-sm leading-relaxed text-gray-600">
                                        Integrated predictive model pipeline to read metrics, cluster data, and decide actuator behaviors.
                                    </p>
                                </div>
                                {/* Feature 4 */}
                                <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition hover:shadow-md">
                                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                                        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                                        </svg>
                                    </div>
                                    <h3 className="mb-3 text-lg font-bold text-gray-900">Conversational Smart Assistant</h3>
                                    <p className="text-sm leading-relaxed text-gray-600">
                                        AI-powered smart chatbot mode to read natural parameter inputs and provide management advice.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>

                {/* Footer Section */}
                <footer className="border-t border-gray-200/50 bg-white/40 backdrop-blur-md px-6 py-8 sm:px-12 lg:px-24">
                    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
                        <div className="flex items-center gap-3">
                            <img src={AppLogo} alt="HydroSmart Logo" className="h-8 w-8 object-contain grayscale opacity-60" />
                            <span className="text-sm text-gray-500">
                                &copy; {new Date().getFullYear()} Team HydroSmart | Group 2
                            </span>
                        </div>
                    </div>
                </footer>

                </div>
            </div>
        </>
    );
}
