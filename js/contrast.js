const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const audio = document.getElementById('bg-music');
audio.volume = 0.3;

// 创建音频分析器
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioContext.createAnalyser();
const audioSource = audioContext.createMediaElementSource(audio);
audioSource.connect(analyser);
analyser.connect(audioContext.destination);

// 配置分析器
analyser.fftSize = 256;
const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

const finalMessage = document.getElementById('final-message');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class StaticStar {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 1.5;
        this.baseAlpha = Math.random() * 0.5 + 0.2;
        this.angle = Math.random() * Math.PI * 2; // 随机初始角度
    }

    update() {
        // 使用正弦波实现自然闪烁
        this.angle += 0.02;
        this.alpha = Math.abs(Math.sin(this.angle)) * this.baseAlpha;
    }

    draw() {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// 流星系统
class Star {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = -10;
        this.speed = Math.random() * 2 + 1.5;
        this.size = Math.random() * 2;
        this.alpha = 1;
        this.maxSteps = Math.ceil(canvas.height / this.speed) + 50;
        this.step = 0;
    }

    update() {
        this.y += this.speed;
        this.step++;
        this.alpha = 1 - (this.step / this.maxSteps);
        
        if (this.step >= this.maxSteps || this.y > canvas.height + 10) {
            this.reset();
        }
    }

    draw() {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
        ctx.fillRect(this.x, this.y, this.size, this.size * 3);
    }
}

// 爱心雨系统
class HeartRain {
    constructor() {
        this.reset();
        this.hue = Math.random() * 360;
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = -50;
        this.baseSpeed = Math.random() * 1 + 0.5;
        this.speed = this.baseSpeed;
        this.baseSize = Math.random() * 20 + 10;
        this.size = this.baseSize;
        this.alpha = 1;
        this.maxSteps = Math.ceil(canvas.height / this.speed) + 30;
        this.step = 0;
        this.pulsePhase = Math.random() * Math.PI * 2;
    }

    update(audioData) {
        // 获取不同频段的音频数据
        const bassValue = audioData.slice(0, 4).reduce((a, b) => a + b) / 4 / 255;
        const midValue = audioData.slice(4, 12).reduce((a, b) => a + b) / 8 / 255;
        const trebleValue = audioData.slice(12, 20).reduce((a, b) => a + b) / 8 / 255;

        // 根据音频数据调整大小和速度
        this.size = this.baseSize * (1 + bassValue * 2);
        this.speed = this.baseSpeed * (1 + midValue);
        this.hue = (this.hue + trebleValue * 5) % 360;

        this.y += this.speed;
        this.step++;
        this.alpha = 1 - (this.step / this.maxSteps);
        
        if (this.step >= this.maxSteps || this.y > canvas.height + 50) {
            this.reset();
        }
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.font = `${this.size}px Arial`;
        ctx.fillStyle = `hsl(${this.hue}, 100%, 50%)`;
        ctx.fillText('❤', this.x, this.y);
        ctx.restore();
    }
}

// 初始化系统
const stars = Array(50).fill().map(() => new Star());
const hearts = Array(30).fill().map(() => new HeartRain());
const staticStars = Array(200).fill().map(() => new StaticStar());



function animate() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 获取音频数据
    analyser.getByteFrequencyData(dataArray);

    // 先绘制静态闪烁星星
    staticStars.forEach(star => {
        star.update();
        star.draw();
    });

    stars.forEach(star => {
        star.update();
        star.draw();
    });

    hearts.forEach(heart => {
        heart.update(dataArray);
        heart.draw();
    });

    // 显示最终文字
    if (performance.now() - startTime > 10000) {
        finalMessage.style.opacity = 1;
        finalMessage.textContent = '我喜欢你'; // 替换为实际名字
    }

    requestAnimationFrame(animate);
}
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // 重新初始化所有元素的位置
    staticStars.forEach(star => {
        star.x = Math.random() * canvas.width;
        star.y = Math.random() * canvas.height;
    });
    
    stars.forEach(star => star.reset());
    hearts.forEach(heart => heart.reset());
});
// 启动动画和音乐
let startTime = performance.now();
window.addEventListener('click', async () => {
    if (audioContext.state === 'suspended') {
        await audioContext.resume();
    }
    audio.play();
    animate();
});