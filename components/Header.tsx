
import React from 'react';

interface HeaderProps {
    onGenerate: () => void;
    isProcessing: boolean;
    isDisabled: boolean;
    isLoading: boolean;
    loadingText: string;
    error: string | null;
    success: string | null;
}

export const Header: React.FC<HeaderProps> = ({ onGenerate, isProcessing, isDisabled, isLoading, loadingText, error, success }) => {
    return (
        <header className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 text-gray-100">Next-Gen AI Mockup Studio</h1>
            <p className="text-xl text-gray-400 mb-8">Professional-grade mockup generation with advanced AI pipeline</p>
            <div className="flex justify-center gap-4 mb-8">
                <button onClick={onGenerate} disabled={isProcessing || isDisabled} className="btn-primary px-8 py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                    {isProcessing ? (
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Processing...
                        </div>
                    ) : 'Generate Art Directions'}
                </button>
            </div>
            {isLoading && (
                <div className="max-w-md mx-auto mb-8">
                    <div className="bg-gray-800 rounded-full h-2 overflow-hidden">
                       <div className="progress-bar h-full w-full"></div>
                    </div>
                    <p className="text-sm text-gray-400 mt-2">{loadingText}</p>
                </div>
            )}
            {error && <div className="max-w-md mx-auto mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">{error}</div>}
            {success && <div className="max-w-md mx-auto mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300">{success}</div>}
        </header>
    );
};
