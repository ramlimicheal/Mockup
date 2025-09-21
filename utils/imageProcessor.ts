
export const extractAdvancedPalette = async (img: HTMLImageElement, n: number = 8): Promise<string[]> => {
    const S = 128; // Sampling resolution
    const cv = document.createElement('canvas');
    cv.width = S;
    cv.height = S;
    const ctx = cv.getContext('2d');
    if (!ctx) return [];
    
    ctx.drawImage(img, 0, 0, S, S);
    const { data } = ctx.getImageData(0, 0, S, S);
    const pixels: number[][] = [];
    
    for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] > 128) { // Ignore transparent pixels
            pixels.push([data[i], data[i + 1], data[i + 2]]);
        }
    }

    if (pixels.length === 0) return [];
    
    // K-means++ initialization
    let centroids: number[][] = [];
    centroids.push(pixels[Math.floor(Math.random() * pixels.length)]);
    
    for (let i = 1; i < n; i++) {
        const distances = pixels.map(p => {
            let minDist = Infinity;
            for (const centroid of centroids) {
                const dist = Math.sqrt(Math.pow(p[0] - centroid[0], 2) + Math.pow(p[1] - centroid[1], 2) + Math.pow(p[2] - centroid[2], 2));
                minDist = Math.min(minDist, dist);
            }
            return minDist * minDist;
        });
        
        const totalDist = distances.reduce((sum, d) => sum + d, 0);
        let rand = Math.random() * totalDist;
        
        for (let j = 0; j < pixels.length; j++) {
            rand -= distances[j];
            if (rand <= 0) {
                centroids.push([...pixels[j]]);
                break;
            }
        }
    }
    
    const maxIterations = 30;
    for (let i = 0; i < maxIterations; i++) {
        const clusters: number[][][] = Array.from({ length: n }, () => []);
        for (const p of pixels) {
            let minDist = Infinity;
            let bestCentroid = 0;
            for (let j = 0; j < n; j++) {
                const dist = Math.sqrt(Math.pow(p[0] - centroids[j][0], 2) + Math.pow(p[1] - centroids[j][1], 2) + Math.pow(p[2] - centroids[j][2], 2));
                if (dist < minDist) {
                    minDist = dist;
                    bestCentroid = j;
                }
            }
            clusters[bestCentroid].push(p);
        }
        let converged = true;
        for (let j = 0; j < n; j++) {
            if (clusters[j].length > 0) {
                const newCentroid = clusters[j].reduce((acc, p) => [acc[0] + p[0], acc[1] + p[1], acc[2] + p[2]], [0, 0, 0]).map(v => Math.round(v / clusters[j].length));
                if (newCentroid[0] !== centroids[j][0] || newCentroid[1] !== centroids[j][1] || newCentroid[2] !== centroids[j][2]) {
                    converged = false;
                    centroids[j] = newCentroid;
                }
            }
        }
        if (converged) break;
    }
    
    return centroids.map(rgb => `#${rgb.map(c => c.toString(16).padStart(2, '0')).join('')}`);
};
