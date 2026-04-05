// ============================================================
// 音效系统 — Web Audio API 合成音效（无需音频文件）
// ============================================================

let audioCtx: AudioContext | null = null;
let enabled = true;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function setSoundEnabled(v: boolean) {
  enabled = v;
}

export function isSoundEnabled(): boolean {
  return enabled;
}

function playTone(freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.15) {
  if (!enabled) return;
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = volume;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch { /* 静默失败 */ }
}

function playNoteSequence(notes: { freq: number; dur: number; type?: OscillatorType; vol?: number }[]) {
  if (!enabled) return;
  try {
    const ctx = getCtx();
    let offset = 0;
    for (const note of notes) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = note.type ?? 'sine';
      osc.frequency.value = note.freq;
      const vol = note.vol ?? 0.12;
      gain.gain.setValueAtTime(vol, ctx.currentTime + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + offset + note.dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + offset);
      osc.stop(ctx.currentTime + offset + note.dur + 0.05);
      offset += note.dur * 0.7;
    }
  } catch { /* 静默失败 */ }
}

// ============================================================
// 各种音效
// ============================================================

/** 点击/贴膜 — 短促清脆的pop */
export function playTap() {
  playTone(800, 0.08, 'sine', 0.1);
  setTimeout(() => playTone(1200, 0.06, 'sine', 0.08), 30);
}

/** 购买产线 — 上升音阶 cha-ching */
export function playBuy() {
  playNoteSequence([
    { freq: 523, dur: 0.08, type: 'sine' },   // C5
    { freq: 659, dur: 0.08, type: 'sine' },   // E5
    { freq: 784, dur: 0.12, type: 'triangle', vol: 0.15 }, // G5
  ]);
}

/** 购买升级 — 上升音效 */
export function playUpgrade() {
  playNoteSequence([
    { freq: 440, dur: 0.06, type: 'sine' },
    { freq: 554, dur: 0.06, type: 'sine' },
    { freq: 659, dur: 0.06, type: 'sine' },
    { freq: 880, dur: 0.15, type: 'triangle', vol: 0.15 },
  ]);
}

/** 雇佣店长 — 欢迎和弦 */
export function playHire() {
  playNoteSequence([
    { freq: 523, dur: 0.15, type: 'sine', vol: 0.1 },
    { freq: 659, dur: 0.15, type: 'sine', vol: 0.1 },
    { freq: 784, dur: 0.15, type: 'sine', vol: 0.12 },
    { freq: 1047, dur: 0.25, type: 'triangle', vol: 0.13 },
  ]);
}

/** 里程碑达成 — 庆祝铃声 */
export function playMilestone() {
  playNoteSequence([
    { freq: 784, dur: 0.1, type: 'sine', vol: 0.12 },
    { freq: 988, dur: 0.1, type: 'sine', vol: 0.12 },
    { freq: 1175, dur: 0.1, type: 'sine', vol: 0.12 },
    { freq: 1319, dur: 0.1, type: 'sine', vol: 0.12 },
    { freq: 1568, dur: 0.3, type: 'triangle', vol: 0.15 },
  ]);
}

/** 成就解锁 — 胜利号角 */
export function playAchievement() {
  playNoteSequence([
    { freq: 523, dur: 0.12, type: 'sine', vol: 0.1 },
    { freq: 659, dur: 0.12, type: 'sine', vol: 0.1 },
    { freq: 784, dur: 0.12, type: 'sine', vol: 0.1 },
    { freq: 1047, dur: 0.2, type: 'triangle', vol: 0.15 },
    { freq: 784, dur: 0.15, type: 'sine', vol: 0.1 },
    { freq: 1047, dur: 0.3, type: 'triangle', vol: 0.15 },
  ]);
}

/** 转生 — 史诗级上升序列 */
export function playPrestige() {
  playNoteSequence([
    { freq: 262, dur: 0.15, type: 'sine', vol: 0.08 },
    { freq: 330, dur: 0.15, type: 'sine', vol: 0.08 },
    { freq: 392, dur: 0.15, type: 'sine', vol: 0.1 },
    { freq: 523, dur: 0.15, type: 'sine', vol: 0.1 },
    { freq: 659, dur: 0.15, type: 'triangle', vol: 0.12 },
    { freq: 784, dur: 0.2, type: 'triangle', vol: 0.12 },
    { freq: 1047, dur: 0.4, type: 'triangle', vol: 0.15 },
  ]);
}

/** 每日登录奖励 — 欢快短曲 */
export function playDailyReward() {
  playNoteSequence([
    { freq: 659, dur: 0.1, type: 'sine', vol: 0.1 },
    { freq: 784, dur: 0.1, type: 'sine', vol: 0.1 },
    { freq: 880, dur: 0.1, type: 'sine', vol: 0.1 },
    { freq: 1047, dur: 0.2, type: 'triangle', vol: 0.12 },
    { freq: 1175, dur: 0.15, type: 'sine', vol: 0.1 },
    { freq: 1319, dur: 0.3, type: 'triangle', vol: 0.15 },
  ]);
}

/** 错误/无法操作 — 低沉嗡嗡声 */
export function playError() {
  playTone(200, 0.15, 'sawtooth', 0.06);
}

/** 市场波动提示 — 上升/下降 */
export function playMarketUp() {
  playNoteSequence([
    { freq: 400, dur: 0.08, type: 'sine', vol: 0.08 },
    { freq: 600, dur: 0.08, type: 'sine', vol: 0.08 },
    { freq: 800, dur: 0.12, type: 'triangle', vol: 0.1 },
  ]);
}

export function playMarketDown() {
  playNoteSequence([
    { freq: 800, dur: 0.08, type: 'sine', vol: 0.08 },
    { freq: 500, dur: 0.08, type: 'sine', vol: 0.08 },
    { freq: 300, dur: 0.15, type: 'triangle', vol: 0.1 },
  ]);
}

/** UI点击 — 极简滴答 */
export function playUIClick() {
  playTone(600, 0.04, 'sine', 0.06);
}

/** 事件触发 — 神秘上升音效 */
export function playEventStart() {
  playNoteSequence([
    { freq: 440, dur: 0.1, type: 'sine', vol: 0.08 },
    { freq: 554, dur: 0.1, type: 'sine', vol: 0.08 },
    { freq: 659, dur: 0.1, type: 'sine', vol: 0.1 },
    { freq: 880, dur: 0.2, type: 'triangle', vol: 0.12 },
    { freq: 1100, dur: 0.3, type: 'triangle', vol: 0.14 },
  ]);
}

/** 事件结束 — 温和下降音效 */
export function playEventEnd() {
  playNoteSequence([
    { freq: 880, dur: 0.1, type: 'sine', vol: 0.1 },
    { freq: 659, dur: 0.1, type: 'sine', vol: 0.08 },
    { freq: 523, dur: 0.2, type: 'triangle', vol: 0.1 },
  ]);
}
