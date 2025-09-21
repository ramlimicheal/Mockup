
import React from 'react';
import type { AspectRatio, OutputQuality } from '../types';

interface OutputSettingsProps {
    aspectRatio: AspectRatio;
    setAspectRatio: (value: AspectRatio) => void;
    outputQuality: OutputQuality;
    setOutputQuality: (value: OutputQuality) => void;
}

const aspectRatios: { v: AspectRatio; l: string }[] = [
    { v: '1/1', l: 'Square' }, 
    { v: '4/5', l: 'Portrait' }, 
    { v: '3/4', l: 'Photo' }, 
    { v: '16/9', l: 'Wide' }
];

const qualityLevels: { v: OutputQuality; d: string }[] = [
    { v: 'HD', d: '2048px' },
    { v: 'Pro', d: '4096px' }
];

export const OutputSettings: React.FC<OutputSettingsProps> = ({ aspectRatio, setAspectRatio, outputQuality, setOutputQuality }) => {
    return (
        <div className="bento-box rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"/> Output Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">Aspect Ratio</label>
                    <div className="grid grid-cols-2 gap-2">
                        {aspectRatios.map(r => (
                            <button key={r.v} onClick={() => setAspectRatio(r.v)} className={`p-3 rounded-lg text-sm transition-all ${aspectRatio === r.v ? 'bg-blue-500/30 border border-blue-500 text-blue-300' : 'bg-white/5 border border-gray-600 hover:bg-white/10'}`}>
                                <div className="font-semibold">{r.l}</div><div className="text-xs text-gray-400">{r.v}</div>
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">Quality</label>
                    <div className="grid grid-cols-2 gap-2">
                        {qualityLevels.map(q => (
                            <button key={q.v} onClick={() => setOutputQuality(q.v)} className={`p-3 rounded-lg text-sm transition-all ${outputQuality === q.v ? 'bg-blue-500/30 border border-blue-500 text-blue-300' : 'bg-white/5 border border-gray-600 hover:bg-white/10'}`}>
                                <div className="font-semibold">{q.v}</div><div className="text-xs text-gray-400">{q.d}</div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
