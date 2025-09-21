
import React from 'react';

interface FileUploadProps {
    id: string;
    label: string;
    accept: string;
    image: HTMLImageElement | null;
    onUpload: (file: File) => void;
    icon: React.ReactNode;
    borderColor: string;
    bgStyle: React.CSSProperties;
}

export const FileUpload: React.FC<FileUploadProps> = ({ id, label, accept, image, onUpload, icon, borderColor, bgStyle }) => {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onUpload(e.target.files[0]);
        }
    };
    
    return (
        <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">{label}</label>
            <div className="upload-zone rounded-xl p-4 text-center">
                {image ? (
                    <div className="space-y-2">
                        <div 
                            className={`w-16 h-16 mx-auto rounded-lg border-2 ${borderColor}`} 
                            style={{ backgroundImage: `url(${image.src})`, ...bgStyle }}
                        ></div>
                        <p className="text-xs text-green-400">✓ Loaded</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <div className="w-16 h-16 mx-auto rounded-lg border-2 border-dashed border-gray-500 flex items-center justify-center">
                            {icon}
                        </div>
                        <p className="text-xs text-gray-400">Upload Image</p>
                    </div>
                )}
                <input type="file" accept={accept} onChange={handleFileChange} className="hidden" id={id}/>
                <label htmlFor={id} className="inline-block mt-2 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg cursor-pointer text-xs font-medium">Choose File</label>
            </div>
        </div>
    );
};
