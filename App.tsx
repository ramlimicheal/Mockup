
import React, { useState, useEffect, useRef, useCallback } from 'react';
// FIX: Changed import from generateArtDirections to generateCreativeDirections, as it was incorrectly named.
import { generateCreativeDirections, enhanceBriefWithAI, generateProfessionalMockup, refineImageWithAI } from './services/geminiService';
import { extractAdvancedPalette } from './utils/imageProcessor';
import { compositeTextOnImage, finalizeWithPrecision, applyPhotographicEffects } from './utils/canvasUtils';
import { downloadImage, imageToBase64, formatFileSize } from './utils/helpers';
import type { ArtDirection, CampaignResult, AspectRatio, OutputQuality } from './types';
import { Header } from './components/Header';
import { ProjectAssets } from './components/ProjectAssets';
import { CreativeDetails } from './components/CreativeDetails';
import { OutputSettings } from './components/OutputSettings';
import { GalleryView } from './components/GalleryView';
import { DetailView } from './components/DetailView';
import { Particles } from './components/Particles';

const App: React.FC = () => {
    const [inspirationImg, setInspirationImg] = useState<HTMLImageElement | null>(null);
    const [logoImg, setLogoImg] = useState<HTMLImageElement | null>(null);
    const [palette, setPalette] = useState<string[]>([]);
    const [creativeBrief, setCreativeBrief] = useState<string>("");
    const [tagline, setTagline] = useState<string>("");
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1/1');
    const [outputQuality, setOutputQuality] = useState<OutputQuality>('HD');
    
    const [campaignResults, setCampaignResults] = useState<CampaignResult[]>([]);
    const [activeResult, setActiveResult] = useState<CampaignResult | null>(null);

    const [artDirections, setArtDirections] = useState<ArtDirection[]>([]);
    const [isProcessingDirections, setIsProcessingDirections] = useState<boolean>(false);
    const [isGeneratingCampaign, setIsGeneratingCampaign] = useState<boolean>(false);
    const [isEnhancingBrief, setIsEnhancingBrief] = useState<boolean>(false);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [isRefining, setIsRefining] = useState<boolean>(false);
    const [editPrompt, setEditPrompt] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const maskCanvasRef = useRef<HTMLCanvasElement>(null);
    const isDrawing = useRef<boolean>(false);

    const displayMessage = (setter: React.Dispatch<React.SetStateAction<string | null>>, message: string) => {
        setter(message);
        setTimeout(() => setter(null), 3000);
    };
    
    const handleInspirationUpload = (file: File) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            setInspirationImg(img);
            displayMessage(setSuccess, `Inspiration loaded (${formatFileSize(file.size)})`);
            URL.revokeObjectURL(url);
        };
        img.src = url;
    };

    const handleLogoUpload = async (file: File) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = async () => {
            setLogoImg(img);
            try {
                const colors = await extractAdvancedPalette(img);
                setPalette(colors);
                displayMessage(setSuccess, `Logo loaded, ${colors.length} colors detected`);
            } catch (e) {
                displayMessage(setError, 'Could not extract color palette');
            } finally {
                URL.revokeObjectURL(url);
            }
        };
        img.src = url;
    };

    const handleEnhanceCreativeBrief = async () => {
        if (!creativeBrief.trim()) return;
        setIsEnhancingBrief(true);
        setError(null);
        try {
            const enhancedBrief = await enhanceBriefWithAI(creativeBrief);
            setCreativeBrief(enhancedBrief);
            displayMessage(setSuccess, 'Creative brief enhanced with AI insights');
        } catch (e) {
            displayMessage(setError, e instanceof Error ? e.message : 'Failed to enhance creative brief');
        } finally {
            setIsEnhancingBrief(false);
        }
    };

    // FIX: Renamed handler to handleGenerateCreativeDirections for clarity and consistency.
    const handleGenerateCreativeDirections = async () => {
        if (!inspirationImg || !logoImg || !creativeBrief.trim()) {
            return displayMessage(setError, 'Please upload inspiration, logo, and provide a brief.');
        }
        setIsProcessingDirections(true);
        setError(null);
        try {
            const inspirationBase64 = imageToBase64(inspirationImg, 'image/jpeg');
            const logoBase64 = imageToBase64(logoImg, 'image/png');
            // FIX: Called the correctly imported function `generateCreativeDirections`.
            const directions = await generateCreativeDirections(inspirationBase64, logoBase64, creativeBrief, palette);
            setArtDirections(directions);
            setCampaignResults([]);
            setActiveResult(null);
            displayMessage(setSuccess, `Generated ${directions.length} creative directions`);
        } catch (e) {
            displayMessage(setError, e instanceof Error ? e.message : 'Failed to generate directions');
        } finally {
            setIsProcessingDirections(false);
        }
    };

    const processMockupGeneration = useCallback(async (direction: ArtDirection) => {
        if (!logoImg) return;
        try {
            const logoBase64 = imageToBase64(logoImg, 'image/png');
            const isUltraQuality = outputQuality === 'Pro';
            let imageBase64 = await generateProfessionalMockup(logoBase64, palette, direction, creativeBrief, isUltraQuality);
            
            let processedImageUrl = `data:image/png;base64,${imageBase64}`;
            if (tagline.trim()) {
                processedImageUrl = await compositeTextOnImage(imageBase64, tagline.trim());
            }

            // Apply photographic post-processing for Pro quality
            if (outputQuality === 'Pro') {
                processedImageUrl = await applyPhotographicEffects(processedImageUrl);
            }

            const maxDim = outputQuality === 'HD' ? 2048 : 4096;
            const finalImageUrl = await finalizeWithPrecision(processedImageUrl, aspectRatio, maxDim);
            
            setCampaignResults(prev => prev.map(r => r.id === direction.title ? { ...r, src: finalImageUrl, status: 'completed' } : r));
        } catch (e) {
            console.error('Mockup generation failed for:', direction.title, e);
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            setCampaignResults(prev => prev.map(r => r.id === direction.title ? { ...r, status: 'failed', error: errorMessage } : r));
        }
    }, [logoImg, outputQuality, palette, creativeBrief, tagline, aspectRatio]);

    const handleGenerateSingleMockup = async (direction: ArtDirection) => {
        setActiveResult(null);
        const initialResult: CampaignResult = { id: direction.title, src: null, status: 'generating', direction, error: null };
        setCampaignResults([initialResult]);
        await processMockupGeneration(direction);
    };

    const handleGenerateCampaign = async () => {
        if (artDirections.length === 0) return;
        setIsGeneratingCampaign(true);
        const initialResults: CampaignResult[] = artDirections.map(d => ({ id: d.title, src: null, status: 'generating', direction: d, error: null }));
        setCampaignResults(initialResults);
        setActiveResult(null);
        await Promise.allSettled(artDirections.map(d => processMockupGeneration(d)));
        setIsGeneratingCampaign(false);
    };

    const handleDownloadMockup = () => {
        if (activeResult && activeResult.src) {
            const timestamp = new Date().toISOString().replace(/:/g, '-').slice(0, 19);
            downloadImage(activeResult.src, `mockup-${timestamp}-${outputQuality}.png`);
            displayMessage(setSuccess, 'Download started!');
        }
    };
    
    const handleRefineImage = async () => {
        if (!editPrompt.trim() || !activeResult?.src || !maskCanvasRef.current) {
             return displayMessage(setError, "Please enter an edit instruction and draw a mask.");
        }
        setIsRefining(true);
        setError(null);
        try {
            const originalImageBase64 = activeResult.src.split(',')[1];
            const maskBase64 = maskCanvasRef.current.toDataURL('image/png').split(',')[1];
            
            const refinedImageBase64 = await refineImageWithAI(originalImageBase64, maskBase64, editPrompt);
            const newImageUrl = `data:image/png;base64,${refinedImageBase64}`;

            const updatedResults = campaignResults.map(r => r.id === activeResult.id ? { ...r, src: newImageUrl } : r);
            setCampaignResults(updatedResults);
            setActiveResult(prev => prev ? { ...prev, src: newImageUrl } : null);
            displayMessage(setSuccess, "Image refined successfully!");
            setIsEditing(false);
            setEditPrompt('');
        } catch(e) {
            displayMessage(setError, e instanceof Error ? `Refinement failed: ${e.message}`: 'Refinement failed');
        } finally {
            setIsRefining(false);
        }
    };

    const isActionInProgress = isProcessingDirections || isGeneratingCampaign || isRefining;

    return (
        <div className="min-h-screen relative overflow-hidden">
            <Particles />
            <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
                <Header
                    // FIX: Updated the onGenerate prop to use the renamed handler.
                    onGenerate={handleGenerateCreativeDirections}
                    isProcessing={isProcessingDirections}
                    isDisabled={!inspirationImg || !logoImg || !creativeBrief.trim()}
                    isLoading={isActionInProgress}
                    loadingText={isProcessingDirections ? 'Analyzing inspiration...' : isGeneratingCampaign ? 'Generating campaign...' : 'Refining image...'}
                    error={error}
                    success={success}
                />

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <ProjectAssets
                            inspirationImg={inspirationImg}
                            logoImg={logoImg}
                            palette={palette}
                            onInspirationUpload={handleInspirationUpload}
                            onLogoUpload={handleLogoUpload}
                        />
                        <CreativeDetails
                            creativeBrief={creativeBrief}
                            setCreativeBrief={setCreativeBrief}
                            tagline={tagline}
                            setTagline={setTagline}
                            onEnhance={handleEnhanceCreativeBrief}
                            isEnhancing={isEnhancingBrief}
                        />
                        <OutputSettings
                            aspectRatio={aspectRatio}
                            setAspectRatio={setAspectRatio}
                            outputQuality={outputQuality}
                            setOutputQuality={setOutputQuality}
                        />
                    </div>

                    <div className="lg:col-span-3">
                        <div className="bento-box rounded-2xl p-6 h-full">
                            {activeResult ? (
                                <DetailView
                                    activeResult={activeResult}
                                    isEditing={isEditing}
                                    isRefining={isRefining}
                                    editPrompt={editPrompt}
                                    setEditPrompt={setEditPrompt}
                                    canvasRef={canvasRef}
                                    maskCanvasRef={maskCanvasRef}
                                    isDrawingRef={isDrawing}
                                    onBack={() => { setIsEditing(false); setActiveResult(null); }}
                                    onDownload={handleDownloadMockup}
                                    onEdit={() => setIsEditing(true)}
                                    onCancelEdit={() => setIsEditing(false)}
                                    onRefine={handleRefineImage}
                                />
                            ) : (
                                <GalleryView
                                    artDirections={artDirections}
                                    campaignResults={campaignResults}
                                    isGeneratingCampaign={isGeneratingCampaign}
                                    onGenerateCampaign={handleGenerateCampaign}
                                    onGenerateSingle={handleGenerateSingleMockup}
                                    onSelectResult={setActiveResult}
                                />
                            )}
                        </div>
                    </div>
                </div>

                <footer className="mt-16 text-center text-gray-500 text-sm">
                    <p>Powered by Hybrid Rendering Pipeline • Next-Gen AI Mockup Studio</p>
                </footer>
            </div>
        </div>
    );
}

export default App;
