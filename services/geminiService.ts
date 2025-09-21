import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { ArtDirection } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToGenerativePart = (base64: string, mimeType: string) => {
    return {
        inlineData: {
            data: base64,
            mimeType,
        },
    };
};

export const refineImageWithAI = async (originalImageBase64: string, maskBase64: string, editPrompt: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [
                    { text: editPrompt },
                    fileToGenerativePart(originalImageBase64, 'image/png'),
                    fileToGenerativePart(maskBase64, 'image/png'),
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

        if (!imagePart || !imagePart.inlineData) {
            throw new Error('No refined image data received from API');
        }
        return imagePart.inlineData.data;

    } catch (error) {
        console.error('AI Refinement Error:', error);
        throw new Error(`AI Refinement Failed: ${error instanceof Error ? error.message : String(error)}`);
    }
};

export const enhanceBriefWithAI = async (brief: string): Promise<string> => {
    const systemPrompt = `You are a world-class creative director and copywriter at a top-tier advertising agency. Your mission is to take a user's simple, high-level creative brief and expand it into a detailed, professional, and evocative brief. Flesh out the concept, considering target audience, mood, lighting, composition, and unique selling proposition. The final output should be a single, well-written paragraph that is ready to be used for generating visual art directions. Respond with only the enhanced paragraph of text. Do not include any preamble, titles, or conversational text.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: brief,
            config: {
                systemInstruction: systemPrompt
            }
        });
        
        const text = response.text;
        if (!text) {
             throw new Error('No enhanced brief received from API');
        }
        return text.trim();
    } catch (error) {
        console.error('Brief Enhancement Error:', error);
        throw new Error(`Brief Enhancement Failed: ${error instanceof Error ? error.message : String(error)}`);
    }
};

export const generateProfessionalMockup = async (logoBase64: string, palette: string[], direction: ArtDirection, brief: string, isUltraQuality: boolean): Promise<string> => {
    const basePrompt = `Art Direction: "${direction.title} - ${direction.description}". Brand colors: ${palette.join(', ')}.`;
    const qualityPrompt = isUltraQuality
        ? "HYPERREALISTIC DOCUMENTARY PHOTOGRAPH: Shot on Phase One XF IQ4 150MP medium format camera with Schneider Kreuznach 80mm f/2.8 lens. Kodak Portra 400 film aesthetic with rich color depth and natural grain structure. The scene captures an authentic, unguarded moment featuring real human interaction with the product in its natural environment. LIGHTING: Golden hour natural light (color temperature 3200K) creates warm, dimensional shadows that wrap organically around surfaces. Volumetric atmospheric haze adds depth. Light reflects realistically off fabric fibers, showing micro-texture details like cotton weave, denim grain, or fabric pilling. COMPOSITION: Shallow depth of field (f/2.8) with cinematic bokeh separation. Rule of thirds composition with natural asymmetry. Captured candid gesture mid-motion for authentic storytelling. MATERIAL AUTHENTICITY: Show fabric wrinkles, natural draping, worn edges, subtle color variations, and weathering patterns that prove real-world usage. "
        : "PROFESSIONAL LIFESTYLE PHOTOGRAPHY: Shot on Canon EOS R5 with 85mm f/1.8 lens. Natural lighting with soft directional shadows. Documentary-style candid capture showing authentic product interaction. Shallow depth of field with natural bokeh. Fabric shows realistic texture, draping, and natural wear patterns. Avoid any studio or artificial appearance. ";
    const logoPrompt = "LOGO INTEGRATION MASTERY: The brand logo must be seamlessly woven into the fabric's physical structure, appearing as if screen-printed, embroidered, or heat-transferred during manufacturing. The logo adopts the exact texture, lighting, shadows, and material properties of the garment - including fabric grain direction, thread tension, and surface irregularities. It shows realistic ink saturation variations, slight edge bleeding characteristic of real printing processes, and natural color interaction with the base fabric. The integration is so perfect that it's impossible to distinguish from genuine branded merchandise. Consider fabric stretch, fold distortion, and perspective transformation affecting the logo's appearance naturally.";
    const environmentPrompt = "ENVIRONMENTAL STORYTELLING: Set in an authentic lifestyle environment that reinforces brand values. Natural backgrounds with organic imperfections - uneven surfaces, varied lighting, lived-in spaces. Include environmental context that supports the narrative: urban streets, cozy interiors, outdoor adventures, creative workspaces. Background elements are slightly out of focus but contribute to the story.";
    const technicalPrompt = "TECHNICAL PERFECTION: 16-bit color depth, full dynamic range capture. Proper exposure with detail in both highlights and shadows. Realistic color grading with accurate skin tones and fabric colors. Natural film grain structure. Authentic chromatic aberration and lens characteristics. Perfect focus on product with natural focus fall-off.";
    const negativePrompt = " ABSOLUTELY AVOID: 3D renders, CGI aesthetics, perfect symmetry, studio lighting, artificial backgrounds, plastic appearance, oversaturated colors, digital artifacts, floating objects, fake people, overly clean surfaces, impossible physics, unnatural poses, flat lighting, synthetic materials, perfect gradients, digital noise, compression artifacts, unrealistic proportions.";
    
    const systemInstruction = "You are an award-winning commercial photographer specializing in hyperrealistic brand photography for Fortune 500 companies. Your work is featured in top design portfolios on Behance and Dribbble. Your singular mission: create photographs so realistic they are indistinguishable from actual professional brand photography shoots. Every pixel must contribute to absolute photorealism. You have mastered the art of deception through light, shadow, texture, and authentic human moments. Your images convince viewers they are looking at genuine photography, not generated content. Embrace controlled imperfection - the subtle flaws that make reality believable. Your technical mastery includes understanding of camera optics, film characteristics, natural lighting physics, fabric behavior, and authentic human interaction patterns. Reject any digital or artificial aesthetic in favor of organic, lived-in authenticity.";

    const promptText = `${systemInstruction}\n\n${qualityPrompt}${basePrompt}${logoPrompt}${environmentPrompt}${technicalPrompt}${negativePrompt}`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [
                    { text: promptText },
                    fileToGenerativePart(logoBase64, 'image/png'),
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });
        
        const candidate = response.candidates?.[0];
        const imagePart = candidate?.content?.parts?.find(part => part.inlineData);

        if (!imagePart || !imagePart.inlineData) {
            if (candidate?.finishReason === 'SAFETY') {
                console.warn('Image generation was blocked due to safety settings:', candidate.safetyRatings);
                throw new Error("The image generation request was blocked by the API's safety settings. Please try a different art direction or inputs.");
            }
            throw new Error('API did not return an image. The prompt might be too restrictive or the model may have failed to generate an image.');
        }

        return imagePart.inlineData.data;

    } catch(error) {
        console.error('AI Generation Error:', error);
        throw new Error(`Mockup Generation Failed: ${error instanceof Error ? error.message : String(error)}`);
    }
};

export const generateCreativeDirections = async (inspirationBase64: string, logoBase64: string, brief: string, palette: string[]): Promise<ArtDirection[]> => {
    const systemPrompt = `You are an award-winning Creative Director. Analyze the inspiration image and create three distinct, professional art directions.
REQUIREMENTS FOR EACH DIRECTION:
1. 'title': A professional title (3-5 words max).
2. 'description': A concise, cohesive paragraph (50-70 words) that creatively combines: visual composition, product placement, brand color integration (${palette.join(', ')}), lighting, mood, and target audience appeal.
CRITICAL: Do not reference branding from the inspiration image. Focus on translating composition, lighting, and mood.
Respond with a valid JSON array of objects only, where each object has "title" and "description" keys.`;

    const promptText = `Brief: "${brief}"\nColors: ${palette.join(', ')}\n\nGenerate three directions based on this inspiration:`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    { text: promptText },
                    fileToGenerativePart(inspirationBase64, 'image/jpeg'),
                    fileToGenerativePart(logoBase64, 'image/png'),
                ],
            },
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            description: { type: Type.STRING },
                        }
                    }
                },
                systemInstruction: systemPrompt
            }
        });

        const jsonText = response.text;
        if (!jsonText) {
            throw new Error('No creative directions received from API');
        }

        const directions = JSON.parse(jsonText);
        if (!Array.isArray(directions) || directions.length === 0 || !directions[0].title) {
            throw new Error('Invalid directions format received');
        }
        return directions;
    } catch (error) {
        console.error('Creative Direction Error:', error);
        throw new Error(`Creative Direction Failed: ${error instanceof Error ? error.message : String(error)}`);
    }
};
