
import React from 'react';

interface CreativeDetailsProps {
    creativeBrief: string;
    setCreativeBrief: (value: string) => void;
    tagline: string;
    setTagline: (value: string) => void;
    onEnhance: () => void;
    isEnhancing: boolean;
}

export const CreativeDetails: React.FC<CreativeDetailsProps> = ({ creativeBrief, setCreativeBrief, tagline, setTagline, onEnhance, isEnhancing }) => {
    return (
        <div className="bento-box rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
                 <h3 className="text-lg font-semibold flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"/> Creative Details
                 </h3>
                 <button onClick={onEnhance} disabled={isEnhancing || !creativeBrief.trim()} className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded-lg text-xs font-medium disabled:opacity-50 transition-all">
                     {isEnhancing ? 'Enhancing...' : 'AI Enhance ✨'}
                 </button>
            </div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Creative Brief</label>
            <textarea value={creativeBrief} onChange={(e) => setCreativeBrief(e.target.value)} placeholder="e.g., A premium coffee brand t-shirt mockup, minimalist aesthetic..." className="w-full h-28 bg-black/30 border border-gray-600 rounded-lg px-4 py-3 text-sm placeholder-gray-500 resize-none focus:ring-2 focus:ring-blue-500"/>
            <label className="block text-sm font-medium text-gray-300 mt-4 mb-2">Custom Tagline (Optional)</label>
            <input type="text" value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="e.g., Your Brand Name" className="w-full bg-black/30 border border-gray-600 rounded-lg px-4 py-3 text-sm placeholder-gray-500 focus:ring-2 focus:ring-blue-500"/>
        </div>
    );
};
