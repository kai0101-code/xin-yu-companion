"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./signal.module.css";

type Particle = {
  x: number;
  y: number;
  tx: number;
  ty: number;
  seed: number;
  size: number;
};

const phaseCopy = [
  ["signal 01", "有些時候，腦中只剩下雜訊。"],
  ["signal 02", "先不急著弄懂，讓它被看見。"],
  ["signal 03", "混亂之中，輪廓會慢慢回來。"],
  ["signal 04", "你沒有消失，你一直都在這裡。"],
];

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function ease(value: number) {
  return value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

function createParticles(width: number, height: number) {
  const compact = width < 760;
  const count = compact ? 760 : 1500;
  const cx = compact ? width * 0.5 : width * 0.66;
  const cy = compact ? height * 0.43 : height * 0.5;
  const radius = Math.min(width, height) * (compact ? 0.24 : 0.27);

  return Array.from({ length: count }, (_, index): Particle => {
    const ratio = index / count;
    let tx = cx;
    let ty = cy;

    if (ratio < 0.45) {
      const angle = (ratio / 0.45) * Math.PI * 2;
      tx = cx + Math.cos(angle) * radius;
      ty = cy + Math.sin(angle) * radius;
    } else if (ratio < 0.57) {
      const angle = ((ratio - 0.45) / 0.12) * Math.PI * 2;
      const eyeRadius = radius * 0.047 * Math.sqrt(((index * 7) % 37) / 37);
      tx = cx - radius * 0.36 + Math.cos(angle) * eyeRadius;
      ty = cy - radius * 0.2 + Math.sin(angle) * eyeRadius;
    } else if (ratio < 0.69) {
      const angle = ((ratio - 0.57) / 0.12) * Math.PI * 2;
      const eyeRadius = radius * 0.047 * Math.sqrt(((index * 11) % 41) / 41);
      tx = cx + radius * 0.36 + Math.cos(angle) * eyeRadius;
      ty = cy - radius * 0.2 + Math.sin(angle) * eyeRadius;
    } else {
      const t = (ratio - 0.69) / 0.31;
      const angle = t * Math.PI;
      tx = cx - Math.cos(angle) * radius * 0.5;
      ty = cy + radius * 0.18 + Math.sin(angle) * radius * 0.31;
    }

    const seed = (Math.sin(index * 127.1) * 43758.5453) % 1;
    return {
      x: (Math.abs(seed) * 0.83 + ((index * 29) % 100) / 100 * 0.17) * width,
      y: (((index * 47) % 101) / 101) * height,
      tx,
      ty,
      seed: Math.abs(seed),
      size: 0.55 + (index % 5) * 0.24,
    };
  });
}

function SignalCanvas({ cycle, onProgress }: { cycle: number; onProgress: (value: number) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const pointerRef = useRef({ x: -1000, y: -1000 });
  const onProgressRef = useRef(onProgress);

  useEffect(() => {
    onProgressRef.current = onProgress;
  }, [onProgress]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    let frame = 0;
    let start = performance.now();
    let lastReport = 0;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      particlesRef.current = createParticles(width, height);
      start = performance.now();
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    const draw = (time: number) => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const raw = reduceMotion ? 1 : clamp((time - start - 450) / 7200);
      const forming = ease(clamp((raw - 0.16) / 0.68));
      const noise = 1 - forming;
      const pointer = pointerRef.current;

      context.clearRect(0, 0, width, height);
      context.fillStyle = "#efefeb";
      context.fillRect(0, 0, width, height);

      if (noise > 0.02) {
        const bands = Math.round(95 * noise);
        for (let index = 0; index < bands; index += 1) {
          const seed = Math.sin(index * 83.31 + time * 0.004);
          const y = ((index * 67 + time * 0.06) % height + height) % height;
          const bandWidth = (Math.abs(seed) * 0.72 + 0.06) * width;
          const x = ((index * 139) % Math.max(width, 1)) - bandWidth * 0.2;
          context.fillStyle = index % 9 === 0
            ? `rgba(105,128,116,${0.055 * noise})`
            : `rgba(27,31,29,${0.034 * noise})`;
          context.fillRect(x, y, bandWidth, 0.5 + (index % 3));
        }
      }

      context.fillStyle = `rgba(23,29,26,${0.2 + forming * 0.68})`;
      for (const particle of particlesRef.current) {
        const jitter = noise * (8 + particle.seed * 38);
        let x = particle.x + Math.sin(time * 0.006 + particle.seed * 80) * jitter;
        let y = particle.y + Math.cos(time * 0.004 + particle.seed * 55) * jitter * 0.55;
        x += (particle.tx - x) * forming;
        y += (particle.ty - y) * forming;

        if (forming > 0.76) {
          const dx = x - pointer.x;
          const dy = y - pointer.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 78 && distance > 0) {
            const push = (1 - distance / 78) * 18 * forming;
            x += (dx / distance) * push;
            y += (dy / distance) * push;
          }
          const breath = Math.sin(time * 0.0013) * 1.2;
          x += (x - particle.tx) * 0.02 + Math.sin(particle.seed * 40) * breath;
        }

        const length = particle.size + noise * particle.seed * 5;
        context.fillRect(x, y, length, Math.max(0.65, particle.size * (0.7 + forming * 0.3)));
      }

      if (time - lastReport > 90) {
        onProgressRef.current(raw);
        lastReport = time;
      }
      frame = requestAnimationFrame(draw);
    };

    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [cycle]);

  return (
    <canvas
      ref={canvasRef}
      className={styles.canvas}
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        pointerRef.current = { x: event.clientX - rect.left, y: event.clientY - rect.top };
      }}
      onPointerLeave={() => { pointerRef.current = { x: -1000, y: -1000 }; }}
      aria-label="柔和的雜訊顆粒逐漸聚合成一張平靜笑臉"
      role="img"
    />
  );
}

export default function SignalVersion() {
  const [cycle, setCycle] = useState(0);
  const [progress, setProgress] = useState(0);
  const phase = progress < 0.18 ? 0 : progress < 0.48 ? 1 : progress < 0.84 ? 2 : 3;
  const restart = useCallback(() => {
    setProgress(0);
    setCycle((value) => value + 1);
  }, []);

  useEffect(() => {
    document.title = "心嶼・訊號｜心理恢復的另一種想像";
  }, []);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a href="/" className={styles.brand} aria-label="回到心嶼首頁">
          <span>心嶼・訊號</span>
          <small>inner signal / visual study 02</small>
        </a>
        <div className={styles.headerMeta}>
          <span>心理恢復，不是刪除雜訊</span>
          <span>而是重新辨認自己</span>
        </div>
        <button type="button" onClick={restart}>再看一次 ↻</button>
      </header>

      <section className={styles.hero}>
        <SignalCanvas cycle={cycle} onProgress={setProgress} />
        <div className={styles.phase} aria-live="polite">
          <span>{phaseCopy[phase][0]}</span>
          <p>{phaseCopy[phase][1]}</p>
        </div>
        <div className={progress > 0.82 ? `${styles.heroCopy} ${styles.visible}` : styles.heroCopy}>
          <p>Recovery is not erasure.</p>
          <h1>不是所有混亂，<br />都需要立刻被消除。</h1>
          <div>
            <p>當雜訊慢慢被接住，<br />我們才重新看見自己的輪廓。</p>
            <a href="#meaning">向下靠近 <span>↓</span></a>
          </div>
        </div>
        <div className={styles.progress} aria-hidden="true">
          <i style={{ transform: `scaleX(${progress})` }} />
        </div>
      </section>

      <section className={styles.meaning} id="meaning">
        <div className={styles.index}>
          <span>02</span>
          <span>from noise to presence</span>
        </div>
        <div className={styles.meaningTitle}>
          <p>我們不把笑臉當成「痊癒」的證明。</p>
          <h2>真正的恢復，是即使心裡仍有雜訊，<br />你也能認出：那裡面有一個我。</h2>
        </div>
        <div className={styles.meaningText}>
          <p>混亂不是失敗，它常常只是身心正在處理超過負荷的訊號。</p>
          <p>陪伴所做的，是讓訊號慢下來、讓感受有名字，也讓你不必在最模糊的時候獨自判斷自己。</p>
        </div>
      </section>

      <section className={styles.sequence}>
        {phaseCopy.map((item, index) => (
          <article key={item[0]}>
            <small>0{index + 1}</small>
            <span>{["雜訊", "停留", "辨認", "連結"][index]}</span>
            <p>{item[1]}</p>
            <i aria-hidden="true" />
          </article>
        ))}
      </section>

      <section className={styles.closing}>
        <div className={styles.closingFace} aria-hidden="true">
          <i className={styles.eyeLeft} />
          <i className={styles.eyeRight} />
          <i className={styles.mouth} />
        </div>
        <p>你不需要一直保持微笑，<br />才值得被好好陪伴。</p>
        <h2>今天，可以先從<br />聽見一點點自己開始。</h2>
        <div className={styles.closingLinks}>
          <a href="/#companion">進入原版陪伴體驗 <span>↗</span></a>
          <button type="button" onClick={() => { restart(); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
            重看訊號形成 <span>↑</span>
          </button>
        </div>
      </section>
    </main>
  );
}
