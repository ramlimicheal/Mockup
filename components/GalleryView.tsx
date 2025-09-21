
import React from 'react';
import type { ArtDirection, CampaignResult } from '../types';

interface GalleryViewProps {
    artDirections: ArtDirection[];
    campaignResults: CampaignResult[];
    isGeneratingCampaign: boolean;
    onGenerateCampaign: () => void;
    onGenerateSingle: (direction: ArtDirection) => void;
    onSelectResult: (result: CampaignResult) => void;
}

export const GalleryView: React.FC<GalleryViewProps> = ({ artDirections, campaignResults, isGeneratingCampaign, onGenerateCampaign, onGenerateSingle, onSelectResult }) => {
    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"/>
                    {artDirections.length > 0 ? "Campaign Gallery" : "Creative Directions"}
                </h3>
                {artDirections.length > 0 && campaignResults.length === 0 && (
                    <button onClick={onGenerateCampaign} disabled={isGeneratingCampaign} className="btn-primary px-4 py-2 rounded-lg font-semibold text-sm disabled:opacity-50">
                        {isGeneratingCampaign ? 'Generating...' : 'Generate Campaign (All 3)'}
                    </button>
                )}
            </div>

            {artDirections.length === 0 && (
                <div className="text-center py-8 text-gray-400 h-96 flex flex-col items-center justify-center">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                    <p>Generate Art Directions to begin.</p>
                </div>
            )}
            
            {artDirections.length > 0 && campaignResults.length === 0 && (
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    {artDirections.map((d, i) => (
                        <button key={i} onClick={() => onGenerateSingle(d)} disabled={isGeneratingCampaign} className="w-full text-left p-4 rounded-xl transition-all border bg-white/5 border-gray-600 hover:bg-white/10 disabled:opacity-50">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0">{i + 1}</div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold mb-2 truncate">{d.title}</h4>
                                    <p className="text-sm text-gray-400 line-clamp-2">{d.description}</p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {campaignResults.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {campaignResults.map(result => (
                        <div key={result.id} className="relative aspect-square mockup-preview rounded-lg overflow-hidden flex items-center justify-center text-center bento-box">
                            {result.status === 'generating' && <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center z-10"><div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div><p className="text-xs mt-2">Generating...</p></div>}
                            {result.status === 'failed' && <div className="absolute inset-0 bg-red-900/80 p-2 flex flex-col items-center justify-center"><p className="text-sm font-semibold text-red-200">Generation Failed</p><p className="text-xs text-red-300 mt-1 line-clamp-3">{result.error}</p></div>}
                            {result.src && result.status === 'completed' && <img src={result.src} className="w-full h-full object-cover" alt={result.direction.title} />}
                            {result.status === 'completed' && (
                                <button onClick={() => onSelectResult(result)} className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <p className="font-semibold">View Details</p>
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
