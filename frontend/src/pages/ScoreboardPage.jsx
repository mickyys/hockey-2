import React, { useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ConfigContext } from '../context/ConfigContext';
import Team from '../components/Team';
import Timer from '../components/Timer';

const getDurationSeconds = (currentConfig, durationType) => {
    const secondsKey = `${durationType}DurationSeconds`;
    const minutesKey = `${durationType}Minutes`;
    const legacyMinutesKey = `${durationType}Duration`;
    const configuredSeconds = Number(currentConfig?.[secondsKey]);

    if (Number.isFinite(configuredSeconds) && configuredSeconds >= 0) {
        return configuredSeconds;
    }

    const configuredMinutes = Number(currentConfig?.[minutesKey]);
    const configuredRemainderSeconds = Number(currentConfig?.[`${durationType}Seconds`]);
    if (Number.isFinite(configuredMinutes) && Number.isFinite(configuredRemainderSeconds)) {
        return Math.max(0, (configuredMinutes * 60) + configuredRemainderSeconds);
    }

    const fallbackMinutes = Number(currentConfig?.[legacyMinutesKey]);
    return Number.isFinite(fallbackMinutes) ? Math.max(0, fallbackMinutes * 60) : 0;
};

const ScoreboardPage = () => {
    const { config } = useContext(ConfigContext);
    const navigate = useNavigate();
    const periodDurationSeconds = getDurationSeconds(config, 'period');
    const halftimeDurationSeconds = getDurationSeconds(config, 'halftime');

    // Sound effects - usar ruta que funcione tanto en dev como en build de Wails
    const buzzerSound = useRef(null);
    const buzzerSource = 'mixkit-bell-ring-buzzer-2962.wav';

    const getBuzzerCandidates = useCallback(() => {
        const candidates = [];
        const normalizedPublicUrl = ((import.meta.env.BASE_URL || '')).replace(/\/$/, '');

        if (normalizedPublicUrl) {
            candidates.push(`${normalizedPublicUrl}/sounds/${buzzerSource}`);
        }

        candidates.push(`/sounds/${buzzerSource}`);
        candidates.push(`./sounds/${buzzerSource}`);

        try {
            candidates.push(new URL(`sounds/${buzzerSource}`, window.location.href).href);
        } catch (error) {
            // Ignorar errores de URL en entornos no estándar
        }

        return [...new Set(candidates)];
    }, []);

    const tryLoadAudioFromPath = useCallback((path) => new Promise((resolve) => {
        const audio = new Audio();
        let settled = false;

        const cleanup = () => {
            audio.removeEventListener('canplaythrough', onReady);
            audio.removeEventListener('loadeddata', onReady);
            audio.removeEventListener('error', onError);
        };

        const finish = (result) => {
            if (settled) return;
            settled = true;
            cleanup();
            resolve(result);
        };

        const onReady = () => finish(audio);
        const onError = () => finish(null);

        audio.preload = 'auto';
        audio.addEventListener('canplaythrough', onReady, { once: true });
        audio.addEventListener('loadeddata', onReady, { once: true });
        audio.addEventListener('error', onError, { once: true });
        audio.src = path;
        audio.load();

        window.setTimeout(() => finish(null), 1500);
    }), []);

    const initBuzzer = useCallback(async () => {
        if (buzzerSound.current) return true;

        const candidates = getBuzzerCandidates();
        for (const path of candidates) {
            // eslint-disable-next-line no-await-in-loop
            const loadedAudio = await tryLoadAudioFromPath(path);
            if (loadedAudio) {
                buzzerSound.current = loadedAudio;
                return true;
            }
        }

        console.warn('No se pudo cargar el sonido del buzzer en rutas locales:', candidates);
        return false;
    }, [getBuzzerCandidates, tryLoadAudioFromPath]);
    
    // Inicializar el audio
    useEffect(() => {
        initBuzzer();
        return () => {
            if (buzzerSound.current) {
                buzzerSound.current.pause();
            }
        };
    }, [initBuzzer]);

    // Función helper para reproducir el sonido de manera segura
    const playBuzzer = useCallback(async () => {
        const isReady = buzzerSound.current || await initBuzzer();
        if (!isReady || !buzzerSound.current) return;

        try {
            buzzerSound.current.currentTime = 0;
            await buzzerSound.current.play();
        } catch (error) {
            console.warn('Error playing buzzer sound:', error);
        }
    }, [initBuzzer]);

    // Team State
    const [homeScore, setHomeScore] = useState(0);
    const [awayScore, setAwayScore] = useState(0);
    const [homeFouls, setHomeFouls] = useState(0);
    const [awayFouls, setAwayFouls] = useState(0);

    // Timer State
    const [gameTime, setGameTime] = useState(config ? periodDurationSeconds : 0);
    const [isRunning, setIsRunning] = useState(false);
    const [period, setPeriod] = useState(1);
    const [isGameOver, setIsGameOver] = useState(false);

    // Halftime State
    const [isHalftime, setIsHalftime] = useState(false);
    const [halftimeTime, setHalftimeTime] = useState(config ? halftimeDurationSeconds : 0);
    const [isHalftimeRunning, setIsHalftimeRunning] = useState(false);

    // Timeout State
    const [isTimeoutActive, setIsTimeoutActive] = useState(false);
    const [timeoutTime, setTimeoutTime] = useState(60);
    const [timeoutTeam, setTimeoutTeam] = useState(null);
    const [homeTimeoutUsed, setHomeTimeoutUsed] = useState(false);
    const [awayTimeoutUsed, setAwayTimeoutUsed] = useState(false);

    const advanceToNextPeriod = useCallback(() => {
        if (period < config.totalPeriods) {
            setPeriod(p => p + 1);
            setGameTime(periodDurationSeconds);
            setHomeTimeoutUsed(false);
            setAwayTimeoutUsed(false);
            setIsHalftime(false);
            setIsHalftimeRunning(false);
            setHalftimeTime(halftimeDurationSeconds);
        } else {
            setIsGameOver(true);
            setIsRunning(false);
        }
    }, [period, config, periodDurationSeconds, halftimeDurationSeconds]);

    const endPeriod = useCallback(() => {
        setIsRunning(false);
        if (period === config.halftimeAfterPeriod && halftimeDurationSeconds > 0) {
            setIsHalftime(true);
        } else {
            advanceToNextPeriod();
        }
    }, [period, config, halftimeDurationSeconds, advanceToNextPeriod]);

    const startTimeout = useCallback((team) => {
        if (isTimeoutActive || (team === 'home' && homeTimeoutUsed) || (team === 'away' && awayTimeoutUsed)) return;

        setIsRunning(false);
        setIsTimeoutActive(true);
        setTimeoutTeam(team);
        setTimeoutTime(60);

        if (team === 'home') setHomeTimeoutUsed(true);
        if (team === 'away') setAwayTimeoutUsed(true);
    }, [isTimeoutActive, homeTimeoutUsed, awayTimeoutUsed]);

    const toggleMainTimer = useCallback(() => {
        setIsRunning(prev => {
            if (prev) return false;
            return !isTimeoutActive && !isHalftime && !isGameOver;
        });
    }, [isTimeoutActive, isHalftime, isGameOver]);

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.target.tagName.toLowerCase() === 'input') return;

            const isSpaceKey = event.code === 'Space' || event.key === ' ' || event.key === 'Spacebar';
            if (isSpaceKey) {
                event.preventDefault();
                toggleMainTimer();
                return;
            }

            const keyActions = {
                'Enter': () => playBuzzer(),
                'Digit1': () => setHomeScore(s => s + 1),
                'Digit2': () => setHomeScore(s => Math.max(0, s - 1)),
                'Digit9': () => setAwayScore(s => s + 1),
                'Digit0': () => setAwayScore(s => Math.max(0, s - 1)),
                'KeyQ': () => setHomeFouls(f => f + 1),
                'KeyW': () => setHomeFouls(f => Math.max(0, f - 1)),
                'KeyO': () => setAwayFouls(f => f + 1),
                'KeyP': () => setAwayFouls(f => Math.max(0, f - 1)),
                'KeyH': () => startTimeout('home'),
                'KeyA': () => startTimeout('away'),
            };

            if (keyActions[event.code]) {
                event.preventDefault();
                keyActions[event.code]();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [startTimeout, playBuzzer, toggleMainTimer]);


    useEffect(() => {
        if (!config) {
            navigate('/');
        }
    }, [config, navigate]);

    useEffect(() => {
        let interval = null;
        if (isRunning && gameTime > 0 && !isTimeoutActive && !isGameOver) {
            interval = setInterval(() => {
                setGameTime(prevTime => {
                    const newTime = Math.max(prevTime - 1, 0);
                    if (newTime === 0) {
                        playBuzzer();
                        endPeriod();
                    }
                    return newTime;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRunning, gameTime, isTimeoutActive, isGameOver, endPeriod, playBuzzer]);

    useEffect(() => {
        let timeoutInterval = null;
        if (isTimeoutActive && timeoutTime > 0) {
            timeoutInterval = setInterval(() => {
                setTimeoutTime(prevTime => {
                    const newTime = Math.max(prevTime - 1, 0);
                    if (newTime === 0) {
                        playBuzzer();
                        setIsTimeoutActive(false);
                        setTimeoutTeam(null);
                    }
                    return newTime;
                });
            }, 1000);
        }
        return () => clearInterval(timeoutInterval);
    }, [isTimeoutActive, timeoutTime, playBuzzer]);

    useEffect(() => {
        let halftimeInterval = null;
        if (isHalftime && isHalftimeRunning && halftimeTime > 0) {
            halftimeInterval = setInterval(() => {
                setHalftimeTime(prevTime => {
                    const newTime = Math.max(prevTime - 1, 0);
                    if (newTime === 0) {
                        playBuzzer();
                        advanceToNextPeriod();
                    }
                    return newTime;
                });
            }, 1000);
        }
        return () => clearInterval(halftimeInterval);
    }, [isHalftime, isHalftimeRunning, halftimeTime, advanceToNextPeriod, playBuzzer]);

    if (!config) {
        return null;
    }

    const timerState = {
        gameTime, isRunning, period, isHalftime, halftimeTime, isHalftimeRunning, isTimeoutActive, timeoutTime, timeoutTeam, isGameOver
    };
    const timerActions = {
        toggleTimer: () => setIsRunning(prev => !prev && !isTimeoutActive && !isHalftime && !isGameOver),
        resetTimer: () => {
            setIsRunning(false);
            setGameTime(periodDurationSeconds);
            setIsGameOver(false);
            setPeriod(1);
        },
        startHalftime: () => setIsHalftimeRunning(true)
    };
    const homeTeamState = { score: homeScore, fouls: homeFouls, timeoutUsed: homeTimeoutUsed };
    const awayTeamState = { score: awayScore, fouls: awayFouls, timeoutUsed: awayTimeoutUsed };
    const homeTeamActions = { setScore: setHomeScore, setFouls: setHomeFouls };
    const awayTeamActions = { setScore: setAwayScore, setFouls: setAwayFouls };

    return (
        <div>
            <div className={`scoreboard ${isTimeoutActive ? `timeout-active timeout-${timeoutTeam}` : ''}`}>
                <Team teamType="home" config={config} startTimeout={startTimeout} teamState={homeTeamState} teamActions={homeTeamActions} />
                <Timer config={config} timerState={timerState} timerActions={timerActions} />
                <Team teamType="away" config={config} startTimeout={startTimeout} teamState={awayTeamState} teamActions={awayTeamActions} />
            </div>
            <div id="controls-container" className="controls-container">
                <Link to="/" className="btn-config">Configuración</Link>
            </div>
        </div>
    );
};

export default ScoreboardPage;
