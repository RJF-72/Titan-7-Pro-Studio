// Waveform Generation Utilities

class WaveformGenerator {
    static generateRandomWaveform(width, height, seed = 0) {
        const data = [];
        const bars = Math.floor(width / 5);
        
        for (let i = 0; i < bars; i++) {
            const randomValue = Math.sin(i * 0.1 + seed) * 0.5 + 0.5;
            const height_value = randomValue * height * 0.8;
            data.push(height_value);
        }
        
        return data;
    }

    static drawWaveform(canvas, data, color = '#00d4ff') {
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = color;
        
        const barWidth = 3;
        const gap = 2;
        
        data.forEach((barHeight, i) => {
            const x = i * (barWidth + gap);
            const y = (height - barHeight) / 2;
            ctx.fillRect(x, y, barWidth, barHeight);
        });
    }
}

// Export for use in other files
window.WaveformGenerator = WaveformGenerator;