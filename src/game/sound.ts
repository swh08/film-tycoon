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

// ============================================================
// SFX Volume Control
// ============================================================

let sfxVolumeValue = 0.8;

export function setSfxVolumeValue(v: number) {
  sfxVolumeValue = v;
}

function playTone(freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.15) {
  if (!enabled) return;
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = volume * sfxVolumeValue;
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
      const vol = (note.vol ?? 0.12) * sfxVolumeValue;
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

// ============================================================
// 背景音乐系统 (BGM) — Web Audio API 程序化生成
// ============================================================

let musicGain: GainNode | null = null;
let musicPlaying = false;
let musicVolumeValue = 0.5;
let musicTimeoutId: ReturnType<typeof setTimeout> | null = null;

export function setMusicVolume(v: number) {
  musicVolumeValue = Math.max(0, Math.min(1, v));
  if (musicGain) {
    const ctx = getCtx();
    musicGain.gain.setTargetAtTime(musicVolumeValue * 0.03, ctx.currentTime, 0.1);
  }
}

export function startMusic() {
  if (musicPlaying) return;
  musicPlaying = true;
  const ctx = getCtx();
  musicGain = ctx.createGain();
  musicGain.gain.value = 0;
  musicGain.gain.linearRampToValueAtTime(musicVolumeValue * 0.03, ctx.currentTime + 1.0); // 1秒淡入
  musicGain.connect(ctx.destination);

  playMusicLoop(ctx, musicGain);
}

export function stopMusic() {
  if (!musicPlaying) return;
  musicPlaying = false;

  if (musicTimeoutId) {
    clearTimeout(musicTimeoutId);
    musicTimeoutId = null;
  }

  if (musicGain) {
    const ctx = getCtx();
    try {
      musicGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
      const nodeToDisconnect = musicGain;
      setTimeout(() => {
        try { nodeToDisconnect.disconnect(); } catch { /* ignore */ }
      }, 600);
    } catch { /* ignore */ }
    musicGain = null;
  }
}

export function isMusicPlaying(): boolean {
  return musicPlaying;
}

/** 播放一个音乐循环 — 柔和的五声音阶环境音 */
function playMusicLoop(ctx: AudioContext, dest: GainNode) {
  if (!musicPlaying || !dest) return;

  // C大调五声音阶 + Am + F + G 和弦进行
  // 低八度贝斯 + 和弦垫底 + 简单旋律点缀
  const chordDuration = 3.0; // 每个和弦3秒
  const totalDuration = 4 * chordDuration; // 12秒一个循环

  const chords: { bass: number; pad: number[]; melody: number }[] = [
    { bass: 130.81, pad: [261.63, 329.63, 392.00], melody: 523.25 }, // C major
    { bass: 110.00, pad: [220.00, 261.63, 329.63], melody: 440.00 }, // A minor
    { bass: 87.31,  pad: [174.61, 220.00, 261.63], melody: 349.23 }, // F major
    { bass: 98.00,  pad: [196.00, 246.94, 293.66], melody: 392.00 }, // G major
  ];

  let time = ctx.currentTime + 0.05;

  for (const chord of chords) {
    // 贝斯音 — 柔和的正弦波
    const bassOsc = ctx.createOscillator();
    const bassGain = ctx.createGain();
    bassOsc.type = 'sine';
    bassOsc.frequency.value = chord.bass;
    bassGain.gain.setValueAtTime(0, time);
    bassGain.gain.linearRampToValueAtTime(0.5, time + 0.4);
    bassGain.gain.setValueAtTime(0.5, time + chordDuration - 0.4);
    bassGain.gain.linearRampToValueAtTime(0, time + chordDuration);
    bassOsc.connect(bassGain);
    bassGain.connect(dest);
    bassOsc.start(time);
    bassOsc.stop(time + chordDuration + 0.01);

    // 和弦垫底 — 轻柔的三角波
    for (let i = 0; i < chord.pad.length; i++) {
      const padOsc = ctx.createOscillator();
      const padGain = ctx.createGain();
      padOsc.type = 'triangle';
      padOsc.frequency.value = chord.pad[i];
      // 音量从高到低（高音较轻，营造空间感）
      const vol = 0.25 - i * 0.05;
      padGain.gain.setValueAtTime(0, time + 0.1 * i);
      padGain.gain.linearRampToValueAtTime(vol, time + 0.4 + 0.1 * i);
      padGain.gain.setValueAtTime(vol, time + chordDuration - 0.5);
      padGain.gain.linearRampToValueAtTime(0, time + chordDuration);
      padOsc.connect(padGain);
      padGain.connect(dest);
      padOsc.start(time + 0.1 * i);
      padOsc.stop(time + chordDuration + 0.01);
    }

    // 旋律点缀 — 简单的随机五声音阶音符
    const pentatonic = [
      chord.melody,
      chord.melody * 1.125,  // 大二度
      chord.melody * 1.25,   // 大三度
      chord.melody * 1.5,    // 纯五度
      chord.melody * 1.5 * 1.125, // 八度内五声音阶
    ];

    // 每个和弦期间弹1-2个音符
    const noteCount = Math.random() < 0.4 ? 2 : 1;
    for (let n = 0; n < noteCount; n++) {
      const noteTime = time + 0.5 + n * (chordDuration / (noteCount + 1));
      const noteFreq = pentatonic[Math.floor(Math.random() * pentatonic.length)];
      const noteDur = 0.6 + Math.random() * 0.4;

      const melOsc = ctx.createOscillator();
      const melGain = ctx.createGain();
      melOsc.type = 'sine';
      melOsc.frequency.value = noteFreq;
      melGain.gain.setValueAtTime(0, noteTime);
      melGain.gain.linearRampToValueAtTime(0.12, noteTime + 0.08);
      melGain.gain.exponentialRampToValueAtTime(0.001, noteTime + noteDur);
      melOsc.connect(melGain);
      melGain.connect(dest);
      melOsc.start(noteTime);
      melOsc.stop(noteTime + noteDur + 0.01);
    }

    time += chordDuration;
  }

  // 循环播放
  musicTimeoutId = setTimeout(() => {
    if (musicPlaying) {
      playMusicLoop(ctx, dest);
    }
  }, (totalDuration - 0.3) * 1000);
}
