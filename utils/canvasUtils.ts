
const createHighQualityCanvas = (width: number, height: number) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    if (ctx) {
        ctx.scale(dpr, dpr);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
    }
    return { canvas, ctx };
};

export const compositeTextOnImage = (base64Data: string, textToComposite: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const { canvas, ctx } = createHighQualityCanvas(img.naturalWidth, img.naturalHeight);
            if (!ctx) return reject(new Error("Could not get canvas context"));
            
            ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);

            const fontSize = Math.max(80, Math.floor(img.naturalWidth / 20));
            ctx.font = `bold ${fontSize}px Inter`;
            ctx.fillStyle = '#FFFFFF';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
            ctx.shadowBlur = 15;
            ctx.shadowOffsetX = 5;
            ctx.shadowOffsetY = 5;

            ctx.fillText(textToComposite, canvas.width / (2 * (window.devicePixelRatio || 1)), canvas.height / (1.5 * (window.devicePixelRatio || 1)));

            resolve(canvas.toDataURL('image/png', 1.0));
        };
        img.onerror = reject;
        img.src = `data:image/png;base64,${base64Data}`;
    });
};

export const finalizeWithPrecision = (dataUrl: string, targetAspect: string, maxDim: number = 2048): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const [w, h] = targetAspect.split('/').map(Number);
            const targetRatio = w / h;
            const sourceW = img.naturalWidth;
            const sourceH = img.naturalHeight;
            const sourceRatio = sourceW / sourceH;
            
            let cropW, cropH, cropX, cropY;
            if (targetRatio > sourceRatio) {
                cropW = sourceW;
                cropH = sourceW / targetRatio;
                cropX = 0;
                cropY = (sourceH - cropH) / 2;
            } else {
                cropH = sourceH;
                cropW = sourceH * targetRatio;
                cropY = 0;
                cropX = (sourceW - cropW) / 2;
            }
            
            let finalW, finalH;
            if (targetRatio >= 1) {
                finalW = maxDim;
                finalH = Math.round(maxDim / targetRatio);
            } else {
                finalH = maxDim;
                finalW = Math.round(maxDim * targetRatio);
            }
            
            const { canvas, ctx } = createHighQualityCanvas(finalW, finalH);
            if (!ctx) return reject(new Error("Could not get canvas context"));
            
            ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, finalW, finalH);
            resolve(canvas.toDataURL('image/png', 1.0));
        };
        img.onerror = reject;
        img.src = dataUrl;
    });
};
