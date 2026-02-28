import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Music, Radio, Leaf, CloudRain, Waves, Flame, TreePine, Coffee, Square as SquareIcon, Circle, Heart, Volume2, VolumeX, Volume1, Timer, Clock, X as XIcon } from 'lucide-react';

// ═══════════════════════════════════════════════════════
// Ambient Sound Generators using Web Audio API
// No external API needed!
// ═══════════════════════════════════════════════════════

const SOUND_CATEGORIES = [
    { id: 'music', label: 'Nhạc Chill', icon: <Music size={14} /> },
    { id: 'nature', label: 'Thiên nhiên', icon: <Leaf size={14} /> },
    { id: 'noise', label: 'Noise', icon: <Radio size={14} /> },
];

const SOUND_PRESETS = [
    // ── Music Streams ──
    {
        id: 'lofi',
        name: 'Lo-fi Beats',
        icon: '♫',
        color: '#6C5CE7',
        category: 'music',
        type: 'stream',
        urls: [
            'https://streams.ilovemusic.de/iloveradio17.mp3',
            'https://play.streamafrica.net/lofiradio',
        ],
    },
    {
        id: 'lofi2',
        name: 'Lo-fi Radio',
        icon: '◉',
        color: '#a29bfe',
        category: 'music',
        type: 'stream',
        urls: [
            'http://lofiradio.ru:8000/lofi_mp3_128',
            'http://lofiradio.ru:8000/lofi_mp3_320',
        ],
    },
    {
        id: 'jazz',
        name: 'Jazz Chill',
        icon: '♪',
        color: '#fd79a8',
        category: 'music',
        type: 'stream',
        urls: [
            'https://ais-sa8.cdnstream1.com/3629_128.mp3',
            'https://knkx-live-a.edge.audiocdn.com/6285_64k',
        ],
    },
    {
        id: 'chillout',
        name: 'Chillout',
        icon: '☽',
        color: '#81ecec',
        category: 'music',
        type: 'stream',
        urls: [
            'https://streams.ilovemusic.de/iloveradio7.mp3',
            'https://ais-sa8.cdnstream1.com/3630_128.mp3',
        ],
    },
    // ── Nature Sounds ──
    {
        id: 'rain',
        name: 'Mưa nhẹ',
        icon: '◈',
        color: '#74b9ff',
        category: 'nature',
        type: 'generated',
        generator: 'rain',
    },
    {
        id: 'ocean',
        name: 'Sóng biển',
        icon: '≋',
        color: '#00cec9',
        category: 'nature',
        type: 'generated',
        generator: 'ocean',
    },
    {
        id: 'fire',
        name: 'Lửa trại',
        icon: '◆',
        color: '#fdcb6e',
        category: 'nature',
        type: 'generated',
        generator: 'fire',
    },
    {
        id: 'forest',
        name: 'Rừng đêm',
        icon: '⌘',
        color: '#00b894',
        category: 'nature',
        type: 'generated',
        generator: 'forest',
    },
    {
        id: 'cafe',
        name: 'Quán café',
        icon: '◎',
        color: '#e17055',
        category: 'nature',
        type: 'generated',
        generator: 'cafe',
    },
    // ── Noise ──
    {
        id: 'whitenoise',
        name: 'White Noise',
        icon: '○',
        color: '#dfe6e9',
        category: 'noise',
        type: 'generated',
        generator: 'whitenoise',
    },
    {
        id: 'brownnoise',
        name: 'Brown Noise',
        icon: '●',
        color: '#e17055',
        category: 'noise',
        type: 'generated',
        generator: 'brownnoise',
    },
    {
        id: 'pinknoise',
        name: 'Pink Noise',
        icon: '◐',
        color: '#fd79a8',
        category: 'noise',
        type: 'generated',
        generator: 'pinknoise',
    },
];

// Web Audio noise generators
function createNoiseGenerator(audioCtx, type) {
    const bufferSize = 2 * audioCtx.sampleRate;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);

    switch (type) {
        case 'whitenoise': {
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            break;
        }
        case 'brownnoise': {
            let lastOut = 0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                data[i] = (lastOut + 0.02 * white) / 1.02;
                lastOut = data[i];
                data[i] *= 3.5;
            }
            break;
        }
        case 'rain': {
            // Rain = filtered white noise with random crackles
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                // Add occasional rain drop "plinks"
                const raindrop = Math.random() > 0.9997 ? (Math.random() - 0.5) * 4 : 0;
                data[i] = white * 0.3 + raindrop;
            }
            break;
        }
        case 'ocean': {
            // Ocean waves = modulated brown noise
            const waveFreq = 0.08; // Hz
            for (let i = 0; i < bufferSize; i++) {
                const t = i / audioCtx.sampleRate;
                const wave = Math.sin(2 * Math.PI * waveFreq * t) * 0.5 + 0.5;
                const noise = Math.random() * 2 - 1;
                data[i] = noise * wave * 0.6;
            }
            break;
        }
        case 'fire': {
            // Fire crackling = filtered noise with pops
            let lastOut = 0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                lastOut = (lastOut + 0.04 * white) / 1.04;
                const crackle = Math.random() > 0.9995 ? (Math.random() - 0.3) * 5 : 0;
                data[i] = lastOut * 2 + crackle * 0.3;
            }
            break;
        }
        case 'forest': {
            // Forest = layered: soft noise + cricket patterns
            for (let i = 0; i < bufferSize; i++) {
                const t = i / audioCtx.sampleRate;
                const wind = (Math.random() * 2 - 1) * 0.15;
                const cricket = Math.sin(2 * Math.PI * 4200 * t) *
                    (Math.sin(2 * Math.PI * 3 * t) > 0.7 ? 0.03 : 0);
                data[i] = wind + cricket;
            }
            break;
        }
        case 'cafe': {
            // Cafe = murmur (filtered noise) + occasional clinks
            let lastOut = 0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                lastOut = (lastOut + 0.03 * white) / 1.03;
                const clink = Math.random() > 0.9999 ? Math.sin(i * 0.5) * 0.3 : 0;
                data[i] = lastOut * 2.5 + clink;
            }
            break;
        }
        case 'pinknoise': {
            // Pink noise = 1/f noise, between white and brown
            let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                b0 = 0.99886 * b0 + white * 0.0555179;
                b1 = 0.99332 * b1 + white * 0.0750759;
                b2 = 0.96900 * b2 + white * 0.1538520;
                b3 = 0.86650 * b3 + white * 0.3104856;
                b4 = 0.55000 * b4 + white * 0.5329522;
                b5 = -0.7616 * b5 - white * 0.0168980;
                data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
                b6 = white * 0.115926;
            }
            break;
        }
        default: {
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
        }
    }

    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    return source;
}

export default function FocusMusic() {
    const [isOpen, setIsOpen] = useState(false);
    const [playing, setPlaying] = useState(null); // preset id
    const [volume, setVolume] = useState(0.3);
    const [timer, setTimer] = useState(0); // 0 = no timer, else minutes
    const [timeLeft, setTimeLeft] = useState(0);

    const audioCtxRef = useRef(null);
    const sourceRef = useRef(null);
    const gainRef = useRef(null);
    const audioElRef = useRef(null);
    const timerRef = useRef(null);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopAll();
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    // Timer countdown
    useEffect(() => {
        if (timerRef.current) clearInterval(timerRef.current);

        if (timeLeft > 0 && playing) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        stopAll();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [timeLeft, playing]);

    // Volume change
    useEffect(() => {
        if (gainRef.current) {
            gainRef.current.gain.value = volume;
        }
        if (audioElRef.current) {
            audioElRef.current.volume = volume;
        }
    }, [volume]);

    const stopAll = useCallback(() => {
        try {
            if (sourceRef.current) {
                sourceRef.current.stop();
                sourceRef.current.disconnect();
                sourceRef.current = null;
            }
        } catch (e) { /* ignore */ }

        if (audioElRef.current) {
            audioElRef.current.pause();
            audioElRef.current.src = '';
            audioElRef.current = null;
        }

        if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
            audioCtxRef.current.close().catch(() => { });
            audioCtxRef.current = null;
        }

        gainRef.current = null;
        setPlaying(null);
        setTimeLeft(0);
    }, []);

    const playPreset = useCallback((preset) => {
        // If same preset, toggle off
        if (playing === preset.id) {
            stopAll();
            return;
        }

        // Stop current
        stopAll();

        if (preset.type === 'stream') {
            // Stream audio element
            const audio = new Audio();
            audio.crossOrigin = 'anonymous';
            audio.volume = volume;

            // Try URLs in order
            let urlIdx = 0;
            const tryNext = () => {
                if (urlIdx < preset.urls.length) {
                    audio.src = preset.urls[urlIdx];
                    audio.play().catch(() => {
                        urlIdx++;
                        tryNext();
                    });
                }
            };

            audio.onerror = () => {
                urlIdx++;
                tryNext();
            };

            tryNext();
            audioElRef.current = audio;
        } else {
            // Generated sound via Web Audio API
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            audioCtxRef.current = ctx;

            const gainNode = ctx.createGain();
            gainNode.gain.value = volume;
            gainNode.connect(ctx.destination);
            gainRef.current = gainNode;

            // Add filter for more natural sound
            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = preset.generator === 'whitenoise' ? 8000 :
                preset.generator === 'rain' ? 4000 :
                    preset.generator === 'ocean' ? 2000 : 3500;
            filter.connect(gainNode);

            const source = createNoiseGenerator(ctx, preset.generator);
            source.connect(filter);
            source.start();
            sourceRef.current = source;
        }

        setPlaying(preset.id);

        // Set timer if configured
        if (timer > 0) {
            setTimeLeft(timer * 60);
        }
    }, [playing, volume, timer, stopAll]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${String(s).padStart(2, '0')}`;
    };

    const currentPreset = SOUND_PRESETS.find(p => p.id === playing);

    return (
        <>
            {/* Mini Player Bar - always visible when playing */}
            {playing && !isOpen && (
                <div
                    className="focus-music-mini"
                    onClick={() => setIsOpen(true)}
                >
                    <div className="focus-music-mini-wave">
                        <span></span><span></span><span></span><span></span>
                    </div>
                    <span className="focus-music-mini-name">
                        {currentPreset?.icon} {currentPreset?.name}
                    </span>
                    {timeLeft > 0 && (
                        <span className="focus-music-mini-timer">{formatTime(timeLeft)}</span>
                    )}
                </div>
            )}

            {/* Toggle button */}
            {!playing && !isOpen && (
                <button
                    className="focus-music-fab"
                    onClick={() => setIsOpen(true)}
                    title="Nhạc tập trung"
                >
                    <Music size={20} />
                </button>
            )}

            {/* Full Panel */}
            {isOpen && (
                <div className="focus-music-overlay" onClick={() => setIsOpen(false)}>
                    <div className="focus-music-panel" onClick={e => e.stopPropagation()}>
                        <div className="focus-music-header">
                            <div>
                                <h3><Music size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />Nhạc tập trung</h3>
                                <p>Âm thanh giúp bạn tập trung học tập</p>
                            </div>
                            <button className="focus-music-close" onClick={() => setIsOpen(false)}>✕</button>
                        </div>

                        {/* Sound Grid - Categorized */}
                        {SOUND_CATEGORIES.map(cat => (
                            <div key={cat.id} className="focus-music-category">
                                <div className="focus-music-category-label">{cat.icon} {cat.label}</div>
                                <div className="focus-music-grid">
                                    {SOUND_PRESETS.filter(p => p.category === cat.id).map(preset => (
                                        <button
                                            key={preset.id}
                                            className={`focus-music-card ${playing === preset.id ? 'active' : ''}`}
                                            onClick={() => playPreset(preset)}
                                            style={{
                                                '--card-color': preset.color,
                                                borderColor: playing === preset.id ? preset.color : 'transparent',
                                            }}
                                        >
                                            <span className="focus-music-card-icon">{preset.icon}</span>
                                            <span className="focus-music-card-name">{preset.name}</span>
                                            {playing === preset.id && (
                                                <div className="focus-music-playing-indicator">
                                                    <span></span><span></span><span></span>
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {/* Controls */}
                        <div className="focus-music-controls">
                            {/* Volume */}
                            <div className="focus-music-volume">
                                <span>{volume === 0 ? <VolumeX size={16} /> : volume < 0.5 ? <Volume1 size={16} /> : <Volume2 size={16} />}</span>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    value={volume}
                                    onChange={e => setVolume(parseFloat(e.target.value))}
                                    className="focus-music-slider"
                                />
                                <span className="focus-music-volume-val">{Math.round(volume * 100)}%</span>
                            </div>

                            {/* Timer */}
                            <div className="focus-music-timer">
                                <span><Timer size={14} /></span>
                                <div className="focus-music-timer-options">
                                    {[0, 15, 30, 45, 60, 90].map(mins => (
                                        <button
                                            key={mins}
                                            className={`focus-music-timer-btn ${timer === mins ? 'active' : ''}`}
                                            onClick={() => {
                                                setTimer(mins);
                                                if (playing && mins > 0) setTimeLeft(mins * 60);
                                                else setTimeLeft(0);
                                            }}
                                        >
                                            {mins === 0 ? '∞' : `${mins}p`}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Timer display */}
                            {timeLeft > 0 && (
                                <div className="focus-music-countdown">
                                    <Clock size={12} /> Tự tắt sau: <strong>{formatTime(timeLeft)}</strong>
                                </div>
                            )}
                        </div>

                        {/* Now Playing */}
                        {playing && (
                            <div className="focus-music-now-playing">
                                <div className="focus-music-now-info">
                                    <div className="focus-music-now-wave">
                                        <span></span><span></span><span></span><span></span><span></span>
                                    </div>
                                    <div>
                                        <strong>{currentPreset?.icon} {currentPreset?.name}</strong>
                                        <p>Đang phát...</p>
                                    </div>
                                </div>
                                <button className="focus-music-stop" onClick={stopAll}>
                                    <SquareIcon size={14} /> Dừng
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
