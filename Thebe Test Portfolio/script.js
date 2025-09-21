// This script handles interactive elements and animations, such as the wave effect.

// Simple Perlin noise implementation for the wave animation
class Noise {
    constructor(seed = Math.random()) {
        this.seed = seed;
        this.gradients = {};
    }

    fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    lerp(a, b, t) {
        return a + t * (b - a);
    }

    grad(hash, x, y) {
        const h = hash & 3;
        if (h === 0) return x + y;
        if (h === 1) return -x + y;
        if (h === 2) return x - y;
        return -x - y;
    }

    perlin(x, y) {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        x -= Math.floor(x);
        y -= Math.floor(y);

        const u = this.fade(x);
        const v = this.fade(y);

        const n00 = this.grad(this.p[this.p[X] + Y], x, y);
        const n01 = this.grad(this.p[this.p[X] + Y + 1], x, y - 1);
        const n10 = this.grad(this.p[this.p[X + 1] + Y], x - 1, y);
        const n11 = this.grad(this.p[this.p[X + 1] + Y + 1], x - 1, y - 1);

        const nx0 = this.lerp(n00, n10, u);
        const nx1 = this.lerp(n01, n11, u);
        return this.lerp(nx0, nx1, v);
    }

    // A permutation array to create random but repeatable gradients
    p = Array.from({ length: 512 }, (_, i) => Math.floor(Math.random() * 256));
}

document.addEventListener('DOMContentLoaded', () => {
    const wavesElement = document.querySelector('a-waves');
    const svg = wavesElement.querySelector('.js-svg');
    const noise = new Noise();
    let width = wavesElement.offsetWidth;
    let height = wavesElement.offsetHeight;

    function resizeSvg() {
        width = wavesElement.offsetWidth;
        height = wavesElement.offsetHeight;
        svg.setAttribute('width', width);
        svg.setAttribute('height', height);
    }

    function createWavePath() {
        const numWaves = 4;
        let d = '';
        for (let i = 0; i < numWaves; i++) {
            d += `M0,${height / numWaves * i} C`;
            const numPoints = 20;
            for (let j = 0; j <= numPoints; j++) {
                const x = (j / numPoints) * width;
                const noiseFactor = noise.perlin(x / 150, (Date.now() / 1000 + i * 50) / 10);
                const y = (height / numWaves) * i + noiseFactor * 20;

                if (j === 0) {
                    d += `${x},${y} `;
                } else if (j === numPoints) {
                    d += `${x},${y}`;
                } else {
                    d += `${x},${y}, `;
                }
            }
        }
        return d;
    }

    function updateWaves() {
        const pathData = createWavePath();
        svg.innerHTML = `<path d="${pathData}" stroke="black" fill="none" />`;
        requestAnimationFrame(updateWaves);
    }

    resizeSvg();
    window.addEventListener('resize', resizeSvg);
    updateWaves();
});