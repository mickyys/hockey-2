import React, { useEffect } from 'react';

const Team = ({ teamType, config, startTimeout, teamState, teamActions }) => {
    const { score, fouls, timeoutUsed } = teamState;
    const { setScore, setFouls } = teamActions;

    const isHome = teamType === 'home';
    const teamConfig = {
        name: isHome ? config.homeTeam : config.awayTeam,
        color: isHome ? config.homeColor : config.awayColor,
        logo: isHome ? config.homeLogo : config.awayLogo
    };

    useEffect(() => {
        const teamDisplay = document.getElementById(`${teamType}-team-display`);
        if (teamDisplay) {
            teamDisplay.style.backgroundColor = teamConfig.color;
        }
    }, [teamConfig.color, teamType]);

    return (
        <div className={`team team-${teamType}`} id={`${teamType}-team-display`}>
            <div className="team-header" id={`${teamType}-header`}>
                {teamConfig.logo && <img src={`${teamConfig.logo}`} alt="Logo" className="team-logo" />}
            </div>
            <div className="team-name" id={`${teamType}-name`}>{teamConfig.name}</div>
            <div className="team-score" id={`${teamType}-score`}>{score}</div>
            <div className="team-controls">
                <button className="btn-score" onClick={() => setScore(s => s + 1)}>+</button>
                <button className="btn-score" onClick={() => setScore(s => Math.max(0, s - 1))}>-</button>
            </div>
            <div className="team-fouls">
                <span>Faltas</span>
                <div className="fouls-display">
                    <button className="btn-foul" onClick={() => setFouls(f => f + 1)}>+</button>
                    <span id={`${teamType}-fouls`}>{fouls}</span>
                    <button className="btn-foul" onClick={() => setFouls(f => Math.max(0, f - 1))}>-</button>
                </div>
            </div>
            <div className="team-timeout">
                <button
                    className="btn-timeout"
                    id={`${teamType}-timeout`}
                    onClick={() => startTimeout(teamType)}
                    disabled={timeoutUsed}
                >
                    T. MUERTO
                </button>
                <div className="timeout-status" id={`${teamType}-timeout-status`}>
                    {timeoutUsed ? 'USADO' : 'DISPONIBLE'}
                </div>
            </div>
        </div>
    );
};

export default Team;
