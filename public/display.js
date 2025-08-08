document.addEventListener('DOMContentLoaded', function () {
    // Configuración inicial
    const savedConfig = localStorage.getItem('hockeyScoreboardConfig');
    if (!savedConfig) window.location.href = 'index.html';

    const config = JSON.parse(savedConfig);
    const scoreboard = document.querySelector('.scoreboard');

    // Sonidos
    const timerEndSound = new Audio('sounds/mixkit-bell-ring-buzzer-2962.wav');
    const whistleSound = new Audio('sounds/mixkit-bell-ring-buzzer-2962.wav');

    // Variables de estado
    let homeScore = 0;
    let awayScore = 0;
    let homeFouls = 0;
    let awayFouls = 0;
    let period = 1;
    let isGameRunning = false;
    let gameInterval;
    let gameTime = config.periodDuration * 60;

    // Tiempo muerto
    let timeoutInterval;
    const TIMEOUT_DURATION = 60;
    let isTimeoutActive = false;
    let timeoutTeam = null;
    let homeTimeoutUsed = false;
    let awayTimeoutUsed = false;
    let remainingTimeout = TIMEOUT_DURATION;

    // Entretiempo
    let isHalftime = false;
    let halftimeInterval;
    let halftimeTimeLeft = config.halftimeDuration * 60;

    // Elementos del DOM
    const mainTimer = document.getElementById('main-timer');
    const officialTimer = document.getElementById('official-timer');
    const homeScoreEl = document.getElementById('home-score');
    const awayScoreEl = document.getElementById('away-score');
    const homeFoulsEl = document.getElementById('home-fouls');
    const awayFoulsEl = document.getElementById('away-fouls');
    const periodEl = document.getElementById('period');
    const startPauseBtn = document.getElementById('start-pause');
    const resetBtn = document.getElementById('reset');

    // Aplicar configuración
    document.getElementById('home-name').textContent = config.homeTeam;
    document.getElementById('away-name').textContent = config.awayTeam;
    document.documentElement.style.setProperty('--home-color', config.homeColor);
    document.documentElement.style.setProperty('--away-color', config.awayColor);

    if (config.homeLogo) {
        document.getElementById('home-header').innerHTML = `<img src="${config.homeLogo}" alt="Logo Local" class="team-logo">`;
    }

    if (config.awayLogo) {
        document.getElementById('away-header').innerHTML = `<img src="${config.awayLogo}" alt="Logo Visitante" class="team-logo">`;
    }

    // Funciones de actualización
    function updateScores() {
        homeScoreEl.textContent = homeScore;
        awayScoreEl.textContent = awayScore;
    }

    function updateFouls() {
        homeFoulsEl.textContent = homeFouls;
        awayFoulsEl.textContent = awayFouls;
    }

    function updateTimers() {
        if (isHalftime) {
            mainTimer.textContent = formatTime(halftimeTimeLeft);
            officialTimer.textContent = "ENTRETIEMPO";
        } else if (isTimeoutActive) {
            mainTimer.textContent = formatTime(remainingTimeout);
            officialTimer.textContent = formatTime(gameTime);
        } else {
            mainTimer.textContent = formatTime(gameTime);
            officialTimer.textContent = formatTime(gameTime);
        }
    }

    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    function updatePeriod() {
        periodEl.textContent = period;
    }

    // Control del juego
    function startGameTimer() {
        if (!isGameRunning && !isTimeoutActive && !isHalftime) {
            isGameRunning = true;
            startPauseBtn.textContent = 'PAUSA';
            gameInterval = setInterval(() => {
                if (gameTime > 0) {
                    gameTime--;
                    updateTimers();
                } else {
                    endPeriod();
                }
            }, 1000);
        }
    }

    function pauseGameTimer() {
        if (isGameRunning) {
            isGameRunning = false;
            startPauseBtn.textContent = 'INICIAR';
            clearInterval(gameInterval);
        }
    }

    function toggleGameTimer() {
        if (isGameRunning) {
            pauseGameTimer();
        } else {
            startGameTimer();
        }
    }

    function resetGameTimer() {
        pauseGameTimer();
        if (isHalftime) {
            clearInterval(halftimeInterval);
            isHalftime = false;
            scoreboard.classList.remove('halftime-active');
        }
        gameTime = config.periodDuration * 60;
        updateTimers();
    }

    // Funciones de período
    function endPeriod() {
        pauseGameTimer();
        timerEndSound.play();

        if (period === config.halftimeAfterPeriod && config.halftimeDuration > 0) {
            startHalftime();
        } else {
            advanceToNextPeriod();
        }
    }

    function startHalftime() {
        pauseGameTimer();
        isHalftime = true;
        halftimeTimeLeft = config.halftimeDuration * 60;
        scoreboard.classList.add('halftime-active');
        updateTimers();

        // Esperar acción del usuario para comenzar el entretiempo
        document.getElementById('start-halftime-btn')?.classList.remove('hidden');
    }

    function beginHalftimeCountdown() {
        halftimeInterval = setInterval(() => {
            if (halftimeTimeLeft > 0) {
                halftimeTimeLeft--;
                updateTimers();
            } else {
                endHalftime();
                timerEndSound.play();
            }
        }, 1000);

        document.getElementById('start-halftime-btn')?.classList.add('hidden');
    }



    function endHalftime() {
        clearInterval(halftimeInterval);
        isHalftime = false;
        scoreboard.classList.remove('halftime-active');
        advanceToNextPeriod();
    }

    function advanceToNextPeriod() {
        period = (period < config.totalPeriods) ? period + 1 : 1;
        updatePeriod();
        resetTimeouts();
        resetGameTimer();
    }

    // Tiempos muertos
    function startTimeout(team) {
        if (isTimeoutActive || (team === 'home' && homeTimeoutUsed) || (team === 'away' && awayTimeoutUsed)) return;

        pauseGameTimer();
        isTimeoutActive = true;
        timeoutTeam = team;
        remainingTimeout = TIMEOUT_DURATION;

        if (team === 'home') {
            homeTimeoutUsed = true;
            document.getElementById('home-timeout-status').textContent = 'USADO';
            document.getElementById('home-timeout').disabled = true;
        } else {
            awayTimeoutUsed = true;
            document.getElementById('away-timeout-status').textContent = 'USADO';
            document.getElementById('away-timeout').disabled = true;
        }

        scoreboard.classList.add('timeout-active', `timeout-${team}`);
        updateTimers();

        timeoutInterval = setInterval(() => {
            remainingTimeout--;
            updateTimers();

            if (remainingTimeout <= 0) {
                endTimeout();
            }
        }, 1000);
    }

    function endTimeout() {
        clearInterval(timeoutInterval);
        isTimeoutActive = false;
        scoreboard.classList.remove('timeout-active', 'timeout-home', 'timeout-away');
        whistleSound.play();
        pauseGameTimer();
    }

    function resetTimeouts() {
        clearInterval(timeoutInterval);
        isTimeoutActive = false;
        homeTimeoutUsed = false;
        awayTimeoutUsed = false;

        document.getElementById('home-timeout-status').textContent = 'DISPONIBLE';
        document.getElementById('away-timeout-status').textContent = 'DISPONIBLE';
        document.getElementById('home-timeout').disabled = false;
        document.getElementById('away-timeout').disabled = false;

        scoreboard.classList.remove('timeout-active', 'timeout-home', 'timeout-away');
    }

    // Event listeners para botones
    document.getElementById('home-plus').addEventListener('click', () => { homeScore++; updateScores(); });
    document.getElementById('home-minus').addEventListener('click', () => { if (homeScore > 0) homeScore--; updateScores(); });
    document.getElementById('away-plus').addEventListener('click', () => { awayScore++; updateScores(); });
    document.getElementById('away-minus').addEventListener('click', () => { if (awayScore > 0) awayScore--; updateScores(); });

    document.getElementById('home-foul-plus').addEventListener('click', () => { homeFouls++; updateFouls(); });
    document.getElementById('home-foul-minus').addEventListener('click', () => { if (homeFouls > 0) homeFouls--; updateFouls(); });
    document.getElementById('away-foul-plus').addEventListener('click', () => { awayFouls++; updateFouls(); });
    document.getElementById('away-foul-minus').addEventListener('click', () => { if (awayFouls > 0) awayFouls--; updateFouls(); });

    document.getElementById('start-pause').addEventListener('click', toggleGameTimer);
    document.getElementById('reset').addEventListener('click', resetGameTimer);

    document.getElementById('home-timeout').addEventListener('click', () => startTimeout('home'));
    document.getElementById('away-timeout').addEventListener('click', () => startTimeout('away'));

    document.getElementById('start-halftime-btn').addEventListener('click', beginHalftimeCountdown);


    // Atajos de teclado
    document.addEventListener('keydown', (event) => {
        const tag = document.activeElement.tagName.toLowerCase();
        if (tag === 'input' || tag === 'textarea') return;

        const keyActions = {
            'Space': () => {
                event.preventDefault();
                if (isHalftime && !halftimeInterval) {
                    beginHalftimeCountdown();
                } else if (!isTimeoutActive) {
                    if (isGameRunning) {
                        pauseGameTimer();
                    } else {
                        startGameTimer();
                    }
                }
            },
            'Digit1': () => document.getElementById('home-plus')?.click(),
            'Digit2': () => document.getElementById('home-minus')?.click(),
            'Digit9': () => document.getElementById('away-plus')?.click(),
            'Digit0': () => document.getElementById('away-minus')?.click(),
            'KeyQ': () => document.getElementById('home-foul-plus')?.click(),
            'KeyW': () => document.getElementById('home-foul-minus')?.click(),
            'KeyO': () => document.getElementById('away-foul-plus')?.click(),
            'KeyP': () => document.getElementById('away-foul-minus')?.click(),
            'KeyH': () => document.getElementById('home-timeout')?.click(),
            'KeyA': () => document.getElementById('away-timeout')?.click(),
            'KeyS': () => {
                event.preventDefault();
                whistleSound.currentTime = 0;
                whistleSound.play().catch(e => console.log("Error de silbato:", e));
            },
            'KeyR': () => document.getElementById('reset')?.click()
        };

        if (keyActions[event.code]) {
            event.preventDefault();
            keyActions[event.code]();
        }
    });

    // Pantalla completa
    document.getElementById('enter-fullscreen').addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    });

    // En tu main.js o al inicio de display.js
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('SW registrado'))
            .catch(err => console.log('Error SW:', err));
    }

    // Inicialización
    updateScores();
    updateFouls();
    updateTimers();
    updatePeriod();
    resetTimeouts();
});