
import React from 'react';
import { FileUpload } from './FileUpload';

interface ProjectAssetsProps {
    inspirationImg: HTMLImageElement | null;
    logoImg: HTMLImageElement | null;
    palette: string[];
    onInspirationUpload: (file: File) => void;
    onLogoUpload: (file: File) => void;
}

export const ProjectAssets: React.FC<ProjectAssetsProps> = ({ inspirationImg, logoImg, palette, onInspirationUpload, onLogoUpload }) => {
    return (
        <div className="bento-box rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"/> Project Assets
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FileUpload
                    id="inspiration-upload"
                    label="1. Inspiration"
                    accept="image/*"
                    image={inspirationImg}
                    onUpload={onInspirationUpload}
                    icon={<svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                    borderColor="border-blue-500"
                    bgStyle={{ backgroundSize: 'cover', backgroundPosition: 'center' }}
                />
                <FileUpload
                    id="logo-upload"
                    label="2. Brand Logo"
                    accept="image/png, image/svg+xml"
                    image={logoImg}
                    onUpload={onLogoUpload}
                    icon={<svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" /></svg>}
                    borderColor="border-blue-500"
                    bgStyle={{ backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }}
                />
            </div>
            {palette.length > 0 && (
                <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-300 mb-3">3. Brand Palette</label>
                    <div className="flex flex-wrap gap-2">
                        {palette.map((c, i) => (
                            <div key={i} className="palette-color w-8 h-8 rounded-lg border-2 border-white/20 tooltip" style={{ backgroundColor: c }} data-tooltip={c}></div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
