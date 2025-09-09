import React from 'react';

interface DebugBannerProps {
    show?: boolean;
}

const DebugBanner: React.FC<DebugBannerProps> = ({ show = true }) => {
    if (!show) return null;

    const cwd = window.location.pathname;
    const expectedFiles = [
        'src/index.tsx',
        'src/App.tsx',
        'src/index.css',
    ];

    return (
        <div className="fixed top-16 left-0 right-0 z-50">
            <div className="mx-auto max-w-5xl px-4">
                <div className="bg-yellow-500 text-black rounded-md shadow-md p-3 flex items-start justify-between gap-4">
                    <div>
                        <div className="font-bold">Debug Mode</div>
                        <div className="text-sm opacity-90">CWD (browser path): {cwd}</div>
                        <div className="text-sm opacity-90">Expected files: {expectedFiles.join(', ')}</div>
                    </div>
                    <div className="text-xs">
                        If UI is blank, open DevTools → Console and report red errors. This banner is client-side only.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DebugBanner;
