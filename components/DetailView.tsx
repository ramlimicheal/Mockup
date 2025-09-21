
import React, { useEffect } from 'react';
import type { CampaignResult } from '../types';

interface DetailViewProps {
    activeResult: CampaignResult;
    isEditing: boolean;
    isRefining: boolean;
    editPrompt: string;
    setEditPrompt: (value: string) => void;
    canvasRef: React.RefObject<HTMLCanvasElement>;
    maskCanvasRef: React.RefObject<HTMLCanvasElement>;
    isDrawingRef: React.MutableRefObject<boolean>;
    onBack: () => void;
    onDownload: () => void;
    onEdit: () => void;
    onCancelEdit: () => void;
    onRefine: () => void;
}

export const DetailView: React.FC<DetailViewProps> = ({
    activeResult, isEditing, isRefining, editPrompt, setEditPrompt, canvasRef,
    maskCanvasRef, isDrawingRef, onBack, onDownload, onEdit, onCancelEdit, onRefine
}) => {

    useEffect(() => {
        if (isEditing && canvasRef.current && activeResult && activeResult.src) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            const maskCanvas = maskCanvasRef.current;
            if (!ctx || !maskCanvas) return;
            
            const maskCtx = maskCanvas.getContext('2d');
            if (!maskCtx) return;

            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                maskCanvas.width = img.naturalWidth;
                maskCanvas.height = img.naturalHeight;
                
                ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);
                maskCtx.fillStyle = 'black';
                maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
            };
            img.src = activeResult.src;
        }
    }, [isEditing, activeResult, canvasRef, maskCanvasRef]);

    const startDrawing = ({ nativeEvent }: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isEditing || !canvasRef.current || !maskCanvasRef.current) return;
        const canvas = canvasRef.current;
        const scaleX = canvas.width / canvas.clientWidth;
        const scaleY = canvas.height / canvas.clientHeight;
        const x = nativeEvent.offsetX * scaleX;
        const y = nativeEvent.offsetY * scaleY;

        const ctx = canvas.getContext('2d');
        const maskCtx = maskCanvasRef.current.getContext('2d');
        if (!ctx || !maskCtx) return;

        ctx.beginPath();
        ctx.moveTo(x, y);
        maskCtx.beginPath();
        maskCtx.moveTo(x, y);
        isDrawingRef.current = true;
    };

    const draw = ({ nativeEvent }: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawingRef.current || !isEditing || !canvasRef.current || !maskCanvasRef.current) return;
        const canvas = canvasRef.current;
        const scaleX = canvas.width / canvas.clientWidth;
        const scaleY = canvas.height / canvas.clientHeight;
        const x = nativeEvent.offsetX * scaleX;
        const y = nativeEvent.offsetY * scaleY;

        const ctx = canvas.getContext('2d');
        const maskCtx = maskCanvasRef.current.getContext('2d');
        if (!ctx || !maskCtx) return;
        
        ctx.lineTo(x, y);
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.lineWidth = 40 * scaleX;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
        
        maskCtx.lineTo(x, y);
        maskCtx.strokeStyle = 'white';
        maskCtx.lineWidth = 40 * scaleX;
        maskCtx.lineCap = 'round';
        maskCtx.lineJoin = 'round';
        maskCtx.stroke();
    };

    const stopDrawing = () => {
        if (!isEditing || !canvasRef.current || !maskCanvasRef.current) return;
        canvasRef.current.getContext('2d')?.closePath();
        maskCanvasRef.current.getContext('2d')?.closePath();
        isDrawingRef.current = false;
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    Back to Gallery
                </button>
                <h3 className="text-lg font-semibold text-center truncate">{activeResult.direction.title}</h3>
                <div className="w-24"></div>
            </div>
            <div className="mockup-preview rounded-xl overflow-hidden relative" style={{ aspectRatio: '1/1' }}>
                 {isRefining && <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-20"><div className="loader mb-4"></div><p className="text-sm text-gray-300">Refining image...</p></div>}
                {isEditing ? (
                    <canvas ref={canvasRef} className="w-full h-full object-contain edit-canvas" onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing} />
                ) : (
                   activeResult.src && <img src={activeResult.src} className="w-full h-full object-contain" alt={activeResult.direction.title}/>
                )}
            </div>
            <canvas ref={maskCanvasRef} className="hidden" />
            
            {!isEditing ? (
                <div className="mt-6 space-y-4 max-w-md mx-auto">
                    <div className="flex gap-2">
                        <button onClick={onDownload} className="flex-1 btn-primary py-3 rounded-xl font-semibold">Download</button>
                        <button onClick={onEdit} className="flex-1 py-3 rounded-xl font-semibold bg-white/10 hover:bg-white/20">Edit with AI 🪄</button>
                    </div>
                </div>
            ) : (
                <div className="mt-6 space-y-4 max-w-md mx-auto">
                    <p className="text-center text-sm text-gray-400">Draw a mask on the area you want to change.</p>
                    <input type="text" value={editPrompt} onChange={(e) => setEditPrompt(e.target.value)} placeholder="e.g., Change background to a marble countertop" className="w-full bg-black/30 border border-gray-600 rounded-lg px-4 py-3 text-sm placeholder-gray-500"/>
                    <div className="flex gap-2">
                        <button onClick={onCancelEdit} className="flex-1 py-3 rounded-xl font-semibold bg-white/10 hover:bg-white/20">Cancel</button>
                        <button onClick={onRefine} disabled={isRefining} className="flex-1 btn-primary py-3 rounded-xl font-semibold disabled:opacity-50">
                            {isRefining ? 'Refining...' : 'Refine Image'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
