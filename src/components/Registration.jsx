import React, { useState } from 'react';
import { User, Mail, Lock, GraduationCap, Check, Eye, EyeOff, IdCard } from 'lucide-react';

export default function Registration({ onNavigate }) {
    const [form, setForm] = useState({
        name: '', matric: '', course: '', email: '', password: '', confirm: '',
    });
    const [showPw, setShowPw] = useState(false);
    const [agree, setAgree] = useState(false);
    const [errors, setErrors] = useState({});
    const [isRegistered, setIsRegistered] = useState(false);

    const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

    // Password strength: 0-4
    const strength = [
        form.password.length >= 8,
        /[A-Z]/.test(form.password),
        /[0-9]/.test(form.password),
        /[^A-Za-z0-9]/.test(form.password),
    ].filter(Boolean).length;
    const strengthLabel = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'][strength];
    const strengthColor = ['bg-slate-200', 'bg-red-500', 'bg-amber-500', 'bg-blue-500', 'bg-emerald-500'][strength];

    const validate = () => {
        const err = {};
        if (!form.name.trim()) err.name = 'Full name is required.';
        if (!/^[A-Za-z]\d{9}$/.test(form.matric.trim()))
            err.matric = 'Matric number looks like B032410622.';
        if (!form.course.trim()) err.course = 'Course is required.';
        if (!/^\S+@\S+\.\S+$/.test(form.email)) err.email = 'Enter a valid email address.';
        if (form.password.length < 8) err.password = 'Password must be at least 8 characters.';
        if (form.confirm !== form.password) err.confirm = 'Passwords do not match.';
        if (!agree) err.agree = 'You must accept the terms.';
        return err;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const err = validate();
        setErrors(err);
        if (Object.keys(err).length === 0) setIsRegistered(true); // prototype: no backend yet
    };

    const inputClass = (key) =>
        `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors[key] ? 'border-red-400' : 'border-slate-300'
        }`;

    const Error = ({ k }) =>
        errors[k] ? <p className="text-xs text-red-600 mt-1">{errors[k]}</p> : null;

    // Success screen
    if (isRegistered) {
        return (
            <div className="p-4 md:p-8 bg-slate-50 min-h-screen text-slate-800">
                <div className="max-w-md mx-auto bg-white rounded-xl shadow p-8 text-center mt-10">
                    <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                        <Check size={28} />
                    </div>
                    <h1 className="text-2xl font-bold">Account created!</h1>
                    <p className="text-sm text-slate-500 mt-2">
                        Welcome, {form.name}. A verification email would be sent to{' '}
                        <span className="font-semibold">{form.email}</span> in the real system.
                    </p>
                    <button
                        onClick={() => onNavigate('dashboard')}
                        className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg py-2 text-sm"
                    >
                        Go to Dashboard ➔
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 bg-slate-50 min-h-screen text-slate-800">
            <div className="max-w-md mx-auto bg-white rounded-xl shadow p-6">
                <h1 className="text-2xl font-bold mb-1">Student Registration</h1>
                <p className="text-sm text-slate-500 mb-5">Create your student account to start using Academiu.</p>

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    <label className="block">
                        <span className="flex items-center gap-2 text-xs font-semibold text-slate-600 mb-1"><User size={14} /> Full name</span>
                        <input className={inputClass('name')} value={form.name} onChange={set('name')} />
                        <Error k="name" />
                    </label>

                    <label className="block">
                        <span className="flex items-center gap-2 text-xs font-semibold text-slate-600 mb-1"><IdCard size={14} /> Matric number</span>
                        <input className={inputClass('matric')} value={form.matric} onChange={set('matric')} placeholder="B032410622" />
                        <Error k="matric" />
                    </label>

                    <label className="block">
                        <span className="flex items-center gap-2 text-xs font-semibold text-slate-600 mb-1"><GraduationCap size={14} /> Course</span>
                        <input className={inputClass('course')} value={form.course} onChange={set('course')} placeholder="BITS - Software Development" />
                        <Error k="course" />
                    </label>

                    <label className="block">
                        <span className="flex items-center gap-2 text-xs font-semibold text-slate-600 mb-1"><Mail size={14} /> Email</span>
                        <input type="email" className={inputClass('email')} value={form.email} onChange={set('email')} />
                        <Error k="email" />
                    </label>

                    <label className="block">
                        <span className="flex items-center gap-2 text-xs font-semibold text-slate-600 mb-1"><Lock size={14} /> Password</span>
                        <div className="relative">
                            <input type={showPw ? 'text' : 'password'} className={inputClass('password')} value={form.password} onChange={set('password')} />
                            <button type="button" onClick={() => setShowPw(!showPw)}
                                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600">
                                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {form.password && (
                            <div className="mt-2">
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4].map((n) => (
                                        <div key={n} className={`h-1.5 flex-1 rounded ${strength >= n ? strengthColor : 'bg-slate-200'}`} />
                                    ))}
                                </div>
                                <p className="text-[11px] text-slate-500 mt-1">{strengthLabel}</p>
                            </div>
                        )}
                        <Error k="password" />
                    </label>

                    <label className="block">
                        <span className="flex items-center gap-2 text-xs font-semibold text-slate-600 mb-1"><Lock size={14} /> Confirm password</span>
                        <input type={showPw ? 'text' : 'password'} className={inputClass('confirm')} value={form.confirm} onChange={set('confirm')} />
                        <Error k="confirm" />
                    </label>

                    <div>
                        <label className="flex items-start gap-2 text-xs text-slate-600">
                            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5" />
                            I agree to the Terms of Use and Privacy Policy.
                        </label>
                        <Error k="agree" />
                    </div>

                    <button type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg py-2 text-sm">
                        Register
                    </button>
                </form>

                <p className="text-xs text-slate-500 text-center mt-4">
                    Already have an account?{' '}
                    <button type="button" onClick={() => onNavigate('dashboard')}
                        className="text-blue-600 font-semibold underline">
                        Log in
                    </button>
                </p>
            </div>
        </div>
    );
}