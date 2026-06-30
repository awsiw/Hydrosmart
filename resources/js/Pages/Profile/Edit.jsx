import { useState, useRef } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { Transition } from '@headlessui/react';

// ─── Edit Profile Modal ────────────────────────────────────────────────────────
function EditProfileModal({ show, onClose, user, mustVerifyEmail, status }) {
    const {
        data,
        setData,
        patch,
        errors,
        processing,
        recentlySuccessful,
        reset,
    } = useForm({
        name: user.name,
        email: user.email,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        patch(route('profile.update'), {
            onSuccess: () => onClose(),
        });
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <Modal show={show} onClose={handleClose}>
            <form onSubmit={handleSubmit} className="p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-1">Edit Profile</h2>
                <p className="text-sm text-gray-500 mb-5">Update your name and email address.</p>

                <div className="mb-4">
                    <InputLabel htmlFor="edit-name" value="Name" />
                    <TextInput
                        id="edit-name"
                        className="mt-1 block w-full"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        isFocused
                        autoComplete="name"
                    />
                    <InputError className="mt-1" message={errors.name} />
                </div>

                <div className="mb-4">
                    <InputLabel htmlFor="edit-email" value="Email" />
                    <TextInput
                        id="edit-email"
                        type="email"
                        className="mt-1 block w-full"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                    />
                    <InputError className="mt-1" message={errors.email} />
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <p className="mt-2 text-sm text-gray-600 mb-4">
                        Your email is unverified.{' '}
                        <Link
                            href={route('verification.send')}
                            method="post"
                            as="button"
                            className="text-blue-600 underline hover:text-blue-800"
                        >
                            Resend verification email.
                        </Link>
                    </p>
                )}
                {status === 'verification-link-sent' && (
                    <p className="mb-4 text-sm text-green-600">Verification link sent!</p>
                )}

                <div className="flex items-center justify-end gap-3 mt-6">
                    <SecondaryButton type="button" onClick={handleClose}>
                        Cancel
                    </SecondaryButton>
                    <PrimaryButton disabled={processing}>
                        Save Changes
                    </PrimaryButton>
                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-green-600">Saved.</p>
                    </Transition>
                </div>
            </form>
        </Modal>
    );
}

// ─── Change Password Modal ─────────────────────────────────────────────────────
function ChangePasswordModal({ show, onClose }) {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose();
            },
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }
                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <Modal show={show} onClose={handleClose}>
            <form onSubmit={handleSubmit} className="p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-1">Change Password</h2>
                <p className="text-sm text-gray-500 mb-5">Use a long, random password to stay secure.</p>

                <div className="mb-4">
                    <InputLabel htmlFor="cp-current" value="Current Password" />
                    <TextInput
                        id="cp-current"
                        ref={currentPasswordInput}
                        type="password"
                        className="mt-1 block w-full"
                        value={data.current_password}
                        onChange={(e) => setData('current_password', e.target.value)}
                        autoComplete="current-password"
                        isFocused
                    />
                    <InputError message={errors.current_password} className="mt-1" />
                </div>

                <div className="mb-4">
                    <InputLabel htmlFor="cp-new" value="New Password" />
                    <TextInput
                        id="cp-new"
                        ref={passwordInput}
                        type="password"
                        className="mt-1 block w-full"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        autoComplete="new-password"
                    />
                    <InputError message={errors.password} className="mt-1" />
                </div>

                <div className="mb-4">
                    <InputLabel htmlFor="cp-confirm" value="Confirm New Password" />
                    <TextInput
                        id="cp-confirm"
                        type="password"
                        className="mt-1 block w-full"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        autoComplete="new-password"
                    />
                    <InputError message={errors.password_confirmation} className="mt-1" />
                </div>

                <div className="flex items-center justify-end gap-3 mt-6">
                    <SecondaryButton type="button" onClick={handleClose}>
                        Cancel
                    </SecondaryButton>
                    <PrimaryButton disabled={processing}>
                        Update Password
                    </PrimaryButton>
                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-green-600">Updated.</p>
                    </Transition>
                </div>
            </form>
        </Modal>
    );
}

// ─── Main Profile Page ─────────────────────────────────────────────────────────
export default function Edit({ mustVerifyEmail, status }) {
    const user = usePage().props.auth.user;
    const [showEditModal, setShowEditModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    // Avatar: initials from name
    const initials = (user.name || 'U')
        .split(' ')
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    return (
        <AuthenticatedLayout>
            <Head title="My Profile" />

            <div className="py-10 px-4">
                {/* Page title */}
                <h1 className="text-center text-xs font-bold tracking-[0.25em] text-gray-400 uppercase mb-8">
                    My Profile
                </h1>

                {/* Main panel */}
                <div className="mx-auto max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

                    {/* ── Avatar section ── */}
                    <div className="flex flex-col items-center pt-10 pb-6 px-8 border-b border-gray-100">
                        <div className="relative">
                            <div
                                className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold shadow-md select-none"
                                aria-label={`Avatar for ${user.name}`}
                            >
                                {initials}
                            </div>
                            {/* Change photo button */}
                            <button
                                type="button"
                                title="Change photo (coming soon)"
                                className="absolute -bottom-1 -right-1 w-7 h-7 bg-white border border-gray-200 rounded-full shadow flex items-center justify-center text-gray-500 hover:text-blue-600 hover:border-blue-300 transition"
                                onClick={() => {}}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </button>
                        </div>

                        <p className="mt-4 text-lg font-semibold text-gray-800 leading-tight">{user.name}</p>
                        <p className="text-sm text-gray-400 mt-0.5">{user.email}</p>

                        {/* Verification badge */}
                        {mustVerifyEmail && user.email_verified_at === null && (
                            <span className="mt-2 inline-block text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-3 py-0.5">
                                Email not verified
                            </span>
                        )}
                    </div>

                    {/* ── Action buttons ── */}
                    <div className="px-8 py-5 flex flex-col gap-3 border-b border-gray-100">
                        <button
                            id="btn-edit-profile"
                            type="button"
                            onClick={() => setShowEditModal(true)}
                            className="w-full py-2.5 px-4 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6-6 3 3-6 6H9v-3z" />
                            </svg>
                            Edit Profile
                        </button>

                        <button
                            id="btn-change-password"
                            type="button"
                            onClick={() => setShowPasswordModal(true)}
                            className="w-full py-2.5 px-4 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Change Password
                        </button>
                    </div>

                    {/* ── Support section ── */}
                    <div className="px-8 py-5 border-b border-gray-100">
                        <p className="text-[10px] uppercase tracking-widest font-semibold text-gray-400 mb-3">Support</p>
                        <div className="flex flex-col gap-2">
                            <a
                                href="tel:+621500123"
                                className="flex items-center gap-3 text-sm text-gray-600 hover:text-blue-600 transition group"
                            >
                                <span className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-blue-50 flex items-center justify-center transition flex-shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                </span>
                                <span>Call Center · 1500-123</span>
                            </a>
                            <Link
                                href={route('user-guide')}
                                className="flex items-center gap-3 text-sm text-gray-600 hover:text-blue-600 transition group"
                            >
                                <span className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-blue-50 flex items-center justify-center transition flex-shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </span>
                                <span>User Guide</span>
                            </Link>
                        </div>
                    </div>

                    {/* ── Logout button ── */}
                    <div className="px-8 py-5">
                        <Link
                            id="btn-logout"
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="w-full py-2.5 px-4 rounded-xl border border-red-200 bg-red-50 text-sm font-medium text-red-600 hover:bg-red-100 hover:border-red-300 transition flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Log Out
                        </Link>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <EditProfileModal
                show={showEditModal}
                onClose={() => setShowEditModal(false)}
                user={user}
                mustVerifyEmail={mustVerifyEmail}
                status={status}
            />
            <ChangePasswordModal
                show={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
            />
        </AuthenticatedLayout>
    );
}
