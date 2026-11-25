import React from 'react';
import { Megaphone, Wrench } from 'lucide-react';

export default function AnnouncementBanner({
    message = '',
    maintenanceMode = false,
    className = ''
}) {
    const trimmed = (message || '').trim();
    if (!maintenanceMode && !trimmed) return null;

    const displayMessage = maintenanceMode
        ? trimmed || 'Scheduled Maintenance Active — Student login is temporarily paused.'
        : trimmed;

    return (
        <div
            className={`pennant-banner-wrap shrink-0 w-full ${maintenanceMode ? 'is-maintenance' : 'is-notice'
                } ${className}`}
            role="status"
            aria-live="polite"
        >
            <div className="pennant-banner-frame">
                <div className="pennant-banner-inner">
                    <div className="relative z-10 flex items-center gap-3 sm:gap-4 pr-8 sm:pr-12 min-w-0 w-full">
                        {/* Solid Icon Badge */}
                        <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${maintenanceMode
                                    ? 'bg-rose-600/40 border-rose-300/70 text-rose-100'
                                    : 'bg-[#09152E]/50 border-[#F5D78E]/75 text-[#F5D78E]'
                                }`}
                        >
                            {maintenanceMode ? (
                                <Wrench className="w-4 h-4 sm:w-5 sm:h-5" />
                            ) : (
                                <Megaphone className="w-4 h-4 sm:w-5 sm:h-5" />
                            )}
                        </div>

                        {/* Tag + Crisp Announcement Text */}
                        <div className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-3">
                            <span
                                className={`inline-flex items-center self-start text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-md border shrink-0 ${maintenanceMode
                                        ? 'bg-rose-600 text-white border-rose-300/70'
                                        : 'bg-[#E3C17A] text-[#09152E] border-[#FFF3CA]'
                                    }`}
                            >
                                {maintenanceMode ? 'Maintenance Alert' : 'Arena Announcement'}
                            </span>

                            <p className="text-xs sm:text-sm font-extrabold text-[#FFFDF9] tracking-wide truncate">
                                {displayMessage}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}