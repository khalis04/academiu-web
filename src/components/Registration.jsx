import React, { useState } from 'react';
import { User, Mail, Lock, GraduationCap, Check } from 'lucide-react';

export default function Registration({ onNavigate }) {
    const [studentName, setStudentName] = useState('');
    const [matricNo, setMatricNo] = useState('');
    const [courseCode, setCourseCode] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isRegistered, setIsRegistered] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsRegistered(true); // prototype only: no real backend yet
    };

    const inputClass =
        'w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500';

    return (
        <div className="p-4 md:p-8 bg-slate-50 min-h-screen text-slate-800">
            <div className="max-w-md mx-auto bg-white rounded-xl shadow p-6">
                <h1 className="text-2xl font-bold mb-1">Create your account</h1>
                <p className="text-slate-500 mb-6">Register to start using Academiu.</p>

                {isRegistered && (
                    <div className="flex items-center justify-between gap-2 bg-green-100 text-green-800 rounded-lg p-3 mb-4">
                        <span className="flex items-center gap-2">
                            <Check size={18} /> Account created! (prototype)
                            </span>
                            
                            <button
                            type="button"
                            onClick={() => onNavigate('dashboard')}
                            className="text-xs font-semibold underline">Go to Dashboard ➔
                            </button>
                            </div>
                        )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <label className="block">
                        <span className="flex items-center gap-2 text-sm font-medium mb-1">
                            <User size={16} /> Full name
                        </span>
                        <input className={inputClass} value={studentName}
                            onChange={(e) => setStudentName(e.target.value)} required />
                    </label>

                    <label className="block">
                        <span className="text-sm font-medium mb-1 block">Matric number</span>
                        <input className={inputClass} value={matricNo}
                            onChange={(e) => setMatricNo(e.target.value)} required />
                    </label>

                    <label className="block">
                        <span className="flex items-center gap-2 text-sm font-medium mb-1">
                            <GraduationCap size={16} /> Course
                        </span>
                        <input className={inputClass} value={courseCode}
                            onChange={(e) => setCourseCode(e.target.value)} required />
                    </label>

                    <label className="block">
                        <span className="flex items-center gap-2 text-sm font-medium mb-1">
                            <Mail size={16} /> Email
                        </span>
                        <input type="email" className={inputClass} value={email}
                            onChange={(e) => setEmail(e.target.value)} required />
                    </label>

                    <label className="block">
                        <span className="flex items-center gap-2 text-sm font-medium mb-1">
                            <Lock size={16} /> Password
                        </span>
                        <input type="password" className={inputClass} value={password}
                            onChange={(e) => setPassword(e.target.value)} required />
                    </label>

                    <button type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg py-2">
                        Register
                    </button>
                </form>
            </div>
        </div>
    );
}