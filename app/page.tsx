"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";

const feelings = ["有點累", "心裡很吵", "說不上來", "還算平靜"];

const modes = [
  {
    title: "陪我說說",
    en: "stay with me",
    description: "不用整理成完整的故事。想到哪裡，就從哪裡說起。",
  },
  {
    title: "幫我理一理",
    en: "help me untangle",
    description: "把混在一起的感受輕輕攤開，看見真正讓你在意的地方。",
  },
  {
    title: "先安靜一下",
    en: "quiet, for now",
    description: "暫時不必說話。跟著呼吸，讓身體先回到比較安全的位置。",
  },
];

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

export default function Home() {
  const [feeling, setFeeling] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [mode, setMode] = useState(0);
  const [breathing, setBreathing] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [journal, setJournal] = useState("");
  const [journalSaved, setJournalSaved] = useState(false);

  useEffect(() => {
    const move = (event: PointerEvent) => {
      document.documentElement.style.setProperty("--mouse-x", `${event.clientX}px`);
      document.documentElement.style.setProperty("--mouse-y", `${event.clientY}px`);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("is-visible");
      }),
      { threshold: 0.16 },
    );
    const elements = document.querySelectorAll("[data-reveal]");
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!breathing) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((seconds) => {
        if (seconds <= 1) {
          window.clearInterval(timer);
          setBreathing(false);
          return 60;
        }
        return seconds - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [breathing]);

  const breathPosition = (60 - secondsLeft) % 12;
  const breathLabel = breathPosition < 4 ? "吸氣" : breathPosition < 6 ? "停留" : "吐氣";

  return (
    <main>
      <div className="cursor-halo" aria-hidden="true" />
      <header className="site-header">
        <a className="brand" href="#top" aria-label="心嶼首頁">
          <span>心嶼</span>
          <small>inner isle</small>
        </a>

        <nav className={menuOpen ? "nav is-open" : "nav"} aria-label="主要導覽">
          <a href="#companion" onClick={() => setMenuOpen(false)}>此刻陪伴</a>
          <a href="#journal" onClick={() => setMenuOpen(false)}>情緒日誌</a>
          <a href="#practice" onClick={() => setMenuOpen(false)}>練習</a>
          <a href="#about" onClick={() => setMenuOpen(false)}>關於心嶼</a>
        </nav>

        <button
          className="menu-button"
          type="button"
          aria-label={menuOpen ? "關閉選單" : "開啟選單"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <i />
          <i />
        </button>
      </header>

      <section className="hero" id="top">
        <div className="hero-aside" aria-hidden="true">
          <span>01</span>
          <p>一個讓感受<br />慢慢靠岸的地方</p>
        </div>

        <div className="hero-copy">
          <p className="eyebrow">A quiet place for your inner weather.</p>
          <h1>
            <span>不用急著</span>
            <em>成為更好的誰。</em>
          </h1>
          <p className="hero-note">
            先在這裡，陪此刻的自己待一下。<br />
            不分析、不催促，也不急著找到答案。
          </p>
        </div>

        <div className="ambient-frame" aria-label="緩慢流動的抽象海面">
          <div className="ambient-light" />
          <div className="ambient-horizon" />
          <div className="ambient-grain" />
          <p>inhale&nbsp;&nbsp; · &nbsp;&nbsp;exhale</p>
          <a className="orbit-link" href="#companion">
            <span>和此刻<br />待一下</span>
            <Arrow />
          </a>
        </div>

        <div className="feeling-line" id="companion">
          <p>此刻比較靠近哪一種感覺？</p>
          <div className="feeling-options" role="group" aria-label="選擇此刻的感受">
            {feelings.map((item) => (
              <button
                type="button"
                key={item}
                className={feeling === item ? "is-selected" : ""}
                aria-pressed={feeling === item}
                onClick={() => setFeeling(item)}
              >
                {item}<span>·</span>
              </button>
            ))}
          </div>
          <div className={feeling ? "feeling-response is-visible" : "feeling-response"} aria-live="polite">
            <span>已經收到。</span> 不需要馬上說明原因，我們可以從這個感覺慢慢開始。
          </div>
        </div>

        <a className="scroll-cue" href="#below" aria-label="向下探索">
          <span>scroll to soften</span>
          <i />
        </a>
      </section>

      <section className="soft-intro" id="below">
        <div className="section-index" data-reveal>
          <span>02</span>
          <p>What gentle attention can do.</p>
        </div>
        <div className="soft-intro-title" data-reveal>
          <p>心靈陪伴，不是替你找到答案。</p>
          <h2>它只是讓你在答案出現以前，<br />不必獨自承受所有聲音。</h2>
        </div>
        <p className="soft-intro-copy" data-reveal>
          有些時候，我們需要的不是再多一個方法，而是一個不會立刻評價、分析或離開的空間。
          心嶼把傾聽、書寫與簡短的身體練習放在一起，讓你依自己的速度，靠近此刻真正的感受。
        </p>
        <div className="soft-mark" aria-hidden="true" data-reveal>
          <span>聽</span>
          <i />
        </div>
      </section>

      <section className="mode-section" id="practice">
        <div className="mode-heading" data-reveal>
          <p>Choose the distance you need.</p>
          <h2>你現在，<br />需要哪一種距離？</h2>
        </div>

        <div className="mode-selector" data-reveal>
          {modes.map((item, index) => (
            <button
              key={item.title}
              type="button"
              className={mode === index ? "mode-row is-active" : "mode-row"}
              onClick={() => setMode(index)}
              aria-pressed={mode === index}
            >
              <span>0{index + 1}</span>
              <strong>{item.title}</strong>
              <em>{item.en}</em>
              <i>↗</i>
            </button>
          ))}
        </div>

        <div className="mode-stage" data-reveal>
          <div className="mode-rings" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
          <div className="mode-message" key={mode}>
            <small>0{mode + 1} / 03</small>
            <h3>{modes[mode].title}</h3>
            <p>{modes[mode].description}</p>
            <button type="button">開始這段陪伴 <Arrow /></button>
          </div>
        </div>
      </section>

      <section className={breathing ? "breath-section is-breathing" : "breath-section"}>
        <div className="breath-meta" data-reveal>
          <span>03</span>
          <p>one minute practice</p>
        </div>
        <div className="breath-copy" data-reveal>
          <p>當語言太多，先回到身體。</p>
          <h2>一分鐘，<br />把注意力還給呼吸。</h2>
          <button
            type="button"
            onClick={() => {
              setBreathing((active) => !active);
              setSecondsLeft(60);
            }}
          >
            {breathing ? "暫停練習" : "開始一分鐘呼吸"}
            <span>{breathing ? `${secondsLeft}s` : "01:00"}</span>
          </button>
        </div>
        <div className="breath-visual" data-reveal aria-live="polite">
          <div className="breath-orb">
            <span>{breathing ? breathLabel : "在這裡"}</span>
            <small>{breathing ? secondsLeft : "breathe"}</small>
          </div>
        </div>
        <p className="breath-vertical" aria-hidden="true">inhale · pause · exhale</p>
      </section>

      <section className="journal-section" id="journal">
        <div className="journal-heading" data-reveal>
          <span>04 — Journal</span>
          <h2>留下一句<br />今天的<br />心情。</h2>
          <p>不必完整，也不必正向。<br />只是替今天的自己留一個位置。</p>
        </div>
        <form
          className="journal-form"
          data-reveal
          onSubmit={(event) => {
            event.preventDefault();
            if (!journal.trim()) return;
            setJournalSaved(true);
          }}
        >
          <label htmlFor="journal-entry">如果此刻的感覺能說一句話，它會說什麼？</label>
          <textarea
            id="journal-entry"
            value={journal}
            onChange={(event) => {
              setJournal(event.target.value);
              setJournalSaved(false);
            }}
            placeholder="慢慢寫，不需要把句子完成……"
            rows={5}
          />
          <div className="journal-actions">
            <small>只保留在這次體驗中</small>
            <button type="submit">{journalSaved ? "已經替你收好" : "收下這句話"} <Arrow /></button>
          </div>
        </form>
        <div className="week-rhythm" data-reveal>
          <p>過去七天的內在天氣</p>
          <div>
            {[28, 46, 34, 72, 58, 39, 64].map((height, index) => (
              <span key={index} style={{ "--rhythm": `${height}%` } as CSSProperties}>
                <i />
                <small>{["一", "二", "三", "四", "五", "六", "日"][index]}</small>
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="about-section" id="about">
        <div className="about-quote" data-reveal>
          <p>“Being heard is a quiet form of returning.”</p>
          <h2>被好好聽見，<br />有時就是回到自己的開始。</h2>
        </div>
        <div className="about-boundary" data-reveal>
          <span>關於這個空間</span>
          <p>
            心嶼提供日常的情緒整理與自我陪伴，不進行診斷，也不能取代心理治療或緊急協助。
            如果你正面臨立即的危險，請優先聯絡所在地的緊急服務，或尋找一位可信任的人陪在你身邊。
          </p>
        </div>
      </section>

      <footer>
        <a className="footer-brand" href="#top">
          <span>心嶼</span>
          <small>願每一種感受，都有一處可以靠岸。</small>
        </a>
        <p>Inner Isle — a quiet companion for your inner weather.</p>
        <div>
          <a href="#companion">開始陪伴</a>
          <a href="#about">使用界線</a>
          <span>© 2026</span>
        </div>
      </footer>
    </main>
  );
}
