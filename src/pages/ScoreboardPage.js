import React, { useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ConfigContext } from '../context/ConfigContext';
import Team from '../components/Team';
import Timer from '../components/Timer';

const ScoreboardPage = () => {
    const { config } = useContext(ConfigContext);
    const navigate = useNavigate();

    // Sound effects - usar ruta que funcione tanto en dev como en build de Electron
    const buzzerSound = useRef(null);
    
    // Inicializar el audio
    useEffect(() => {
        const initAudio = () => {
            try {
                // En Electron empaquetado, usar ruta relativa
                const audioPath = './sounds/mixkit-bell-ring-buzzer-2962.wav';
                buzzerSound.current = new Audio(audioPath);
                buzzerSound.current.preload = 'auto';
                
                // Manejar errores de carga
                buzzerSound.current.onerror = () => {
                    console.warn('Error loading buzzer sound from:', audioPath);
                    // Intentar ruta alternativa
                    try {
                        const fallbackPath = process.env.PUBLIC_URL + '/sounds/mixkit-bell-ring-buzzer-2962.wav';
                        buzzerSound.current = new Audio(fallbackPath);
                        buzzerSound.current.preload = 'auto';
                    } catch (error) {
                        console.error('Failed to load buzzer sound:', error);
                    }
                };
            } catch (error) {
                console.error('Failed to initialize buzzer sound:', error);
            }
        };
        
        initAudio();
    }, []);

    // Función helper para reproducir el sonido de manera segura
    const playBuzzer = useCallback(() => {
        if (buzzerSound.current) {
            try {
                buzzerSound.current.currentTime = 0; // Reiniciar desde el inicio
                buzzerSound.current.play().catch(error => {
                    console.warn('Error playing buzzer sound:', error);
                });
            } catch (error) {
                console.warn('Error playing buzzer sound:', error);
            }
        }
    }, []);

    // Team State
    const [homeScore, setHomeScore] = useState(0);
    const [awayScore, setAwayScore] = useState(0);
    const [homeFouls, setHomeFouls] = useState(0);
    const [awayFouls, setAwayFouls] = useState(0);

    // Timer State
    const [gameTime, setGameTime] = useState(config ? config.periodDuration * 60 : 0);
    const [isRunning, setIsRunning] = useState(false);
    const [period, setPeriod] = useState(1);
    const [isGameOver, setIsGameOver] = useState(false);

    // Halftime State
    const [isHalftime, setIsHalftime] = useState(false);
    const [halftimeTime, setHalftimeTime] = useState(config ? config.halftimeDuration * 60 : 0);
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
            setGameTime(config.periodDuration * 60);
            setHomeTimeoutUsed(false);
            setAwayTimeoutUsed(false);
            setIsHalftime(false);
            setIsHalftimeRunning(false);
            setHalftimeTime(config.halftimeDuration * 60);
        } else {
            setIsGameOver(true);
            setIsRunning(false);
        }
    }, [period, config]);

    const endPeriod = useCallback(() => {
        setIsRunning(false);
        // Quitar playBuzzer() porque ya suena a los 3 segundos
        if (period === config.halftimeAfterPeriod && config.halftimeDuration > 0) {
            setIsHalftime(true);
        } else {
            advanceToNextPeriod();
        }
    }, [period, config, advanceToNextPeriod]);

    const startTimeout = useCallback((team) => {
        if (isTimeoutActive || (team === 'home' && homeTimeoutUsed) || (team === 'away' && awayTimeoutUsed)) return;

        setIsRunning(false);
        setIsTimeoutActive(true);
        setTimeoutTeam(team);
        setTimeoutTime(60);

        if (team === 'home') setHomeTimeoutUsed(true);
        if (team === 'away') setAwayTimeoutUsed(true);
    }, [isTimeoutActive, homeTimeoutUsed, awayTimeoutUsed]);

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.target.tagName.toLowerCase() === 'input') return;

            const keyActions = {
                'Space': () => setIsRunning(prev => !prev),
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
    }, [startTimeout, playBuzzer]);


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
                    const newTime = prevTime - 1;
                    // Reproducir sonido cuando queden 3 segundos
                    if (newTime === 2) {
                        setTimeout(() => playBuzzer(), 0);
                    }
                    // Terminar período cuando llegue a 0
                    if (newTime === 0) {
                        setTimeout(() => endPeriod(), 0);
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
                    const newTime = prevTime - 1;
                    // Reproducir sonido cuando queden 3 segundos
                    if (newTime === 2) {
                        setTimeout(() => playBuzzer(), 0);
                    }
                    // Terminar timeout cuando llegue a 0
                    if (newTime === 0) {
                        setTimeout(() => {
                            setIsTimeoutActive(false);
                            setTimeoutTeam(null);
                        }, 0);
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
                    const newTime = prevTime - 1;
                    // Reproducir sonido cuando queden 3 segundos
                    if (newTime === 2) {
                        setTimeout(() => playBuzzer(), 0);
                    }
                    // Terminar descanso cuando llegue a 0
                    if (newTime === 0) {
                        setTimeout(() => advanceToNextPeriod(), 0);
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
            setGameTime(config.periodDuration * 60);
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
