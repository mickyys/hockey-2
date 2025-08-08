import React from 'react';

const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

const Timer = ({ config, timerState, timerActions }) => {
    const { gameTime, isRunning, period, isHalftime, halftimeTime, isHalftimeRunning, isTimeoutActive, timeoutTime, timeoutTeam } = timerState;
    const { toggleTimer, resetTimer, startHalftime } = timerActions;

    let mainDisplay;
    let officialDisplay;

    if (isTimeoutActive) {
        mainDisplay = formatTime(timeoutTime);
        officialDisplay = `TIMEOUT ${timeoutTeam.toUpperCase()}`;
    } else if (isHalftime) {
        mainDisplay = formatTime(halftimeTime);
        officialDisplay = "ENTRETIEMPO";
    } else {
        mainDisplay = formatTime(gameTime);
        officialDisplay = formatTime(gameTime);
    }

    return (
        <div className={`timer-container ${isHalftime ? 'halftime-active' : ''} ${isTimeoutActive ? 'timeout-active' : ''}`}>
            {config.showTimer && <div className="main-timer">{mainDisplay}</div>}
            <div className="official-timer">{officialDisplay}</div>
            <div className="timer-controls">
                {!isHalftime && !isTimeoutActive && (
                    <>
                        <button className="btn-timer" onClick={toggleTimer}>
                            {isRunning ? 'PAUSA' : 'INICIAR'}
                        </button>
                        <button className="btn-timer" onClick={resetTimer}>REINICIAR</button>
                    </>
                )}
                {isHalftime && !isHalftimeRunning && (
                    <button className="btn-timer" onClick={startHalftime}>
                        INICIAR ENTRETIEMPO
                    </button>
                )}
            </div>
            {config.showPeriod && (
                <div className="period-info">
                    <span>PERIODO</span>
                    <span id="period">{period}</span>
                </div>
            )}
        </div>
    );
};

export default Timer;
