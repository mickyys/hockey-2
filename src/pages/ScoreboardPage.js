import React, { useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ConfigContext } from '../context/ConfigContext';
import Team from '../components/Team';
import Timer from '../components/Timer';

const ScoreboardPage = () => {
    const { config } = useContext(ConfigContext);
    const navigate = useNavigate();

    // Sound effects
    const buzzerSound = useRef(new Audio('/sounds/mixkit-bell-ring-buzzer-2962.wav'));

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
        buzzerSound.current.play();
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
                'Enter': () => buzzerSound.current.play(),
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
    }, [startTimeout]);


    useEffect(() => {
        if (!config) {
            navigate('/');
        }
    }, [config, navigate]);

    useEffect(() => {
        let interval = null;
        if (isRunning && gameTime > 0 && !isTimeoutActive && !isGameOver) {
            interval = setInterval(() => {
                setGameTime(prevTime => prevTime - 1);
            }, 1000);
        } else if (gameTime === 0 && isRunning) {
            endPeriod();
        }
        return () => clearInterval(interval);
    }, [isRunning, gameTime, isTimeoutActive, isGameOver, endPeriod]);

    useEffect(() => {
        let timeoutInterval = null;
        if (isTimeoutActive && timeoutTime > 0) {
            timeoutInterval = setInterval(() => {
                setTimeoutTime(prevTime => prevTime - 1);
            }, 1000);
        } else if (isTimeoutActive && timeoutTime === 0) {
            buzzerSound.current.play();
            setIsTimeoutActive(false);
            setTimeoutTeam(null);
        }
        return () => clearInterval(timeoutInterval);
    }, [isTimeoutActive, timeoutTime]);

    useEffect(() => {
        let halftimeInterval = null;
        if (isHalftime && isHalftimeRunning && halftimeTime > 0) {
            halftimeInterval = setInterval(() => {
                setHalftimeTime(prevTime => prevTime - 1);
            }, 1000);
        } else if (isHalftime && isHalftimeRunning && halftimeTime === 0) {
            buzzerSound.current.play();
            advanceToNextPeriod();
        }
        return () => clearInterval(halftimeInterval);
    }, [isHalftime, isHalftimeRunning, halftimeTime, advanceToNextPeriod]);

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

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

    return (
        <div>
            <div className={`scoreboard ${isTimeoutActive ? `timeout-active timeout-${timeoutTeam}` : ''}`}>
                <Team teamType="home" config={config} startTimeout={startTimeout} teamState={homeTeamState} teamActions={homeTeamActions} />
                <Timer config={config} timerState={timerState} timerActions={timerActions} />
                <Team teamType="away" config={config} startTimeout={startTimeout} teamState={awayTeamState} teamActions={awayTeamActions} />
            </div>
            <div id="controls-container" className="controls-container">
                <Link to="/" className="btn-config">Configuración</Link>
                <button className="btn-fullscreen" onClick={toggleFullScreen}>Fullscreen</button>
            </div>
        </div>
    );
};

export default ScoreboardPage;
