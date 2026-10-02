import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConfigContext } from '../context/ConfigContext';
import logoList from '../logo-list.json';

const DEFAULT_CONFIG = {
    homeTeam: 'LOCAL',
    homeColor: '#1a3a8f',
    awayTeam: 'VISITANTE',
    awayColor: '#8f1a1a',
    periodDuration: 20,
    totalPeriods: 2,
    showPeriod: true,
    showTimer: true,
    homeLogo: '',
    awayLogo: '',
    periodMinutes: 20,
    periodSeconds: 0,
    halftimeDuration: 5,
    halftimeMinutes: 5,
    halftimeSeconds: 0,
    periodDurationSeconds: 1200,
    halftimeDurationSeconds: 300,
    halftimeAfterPeriod: 1
};

const parseNumber = (value, fallback, min, max) => {
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed)) return fallback;
    return Math.min(max, Math.max(min, parsed));
};

const normalizeConfigForEditing = (config) => {
    if (!config) {
        return DEFAULT_CONFIG;
    }

    const periodDurationSeconds = Number.isFinite(Number(config.periodDurationSeconds))
        ? Number(config.periodDurationSeconds)
        : parseNumber(config.periodDuration, 20, 0, 999) * 60;
    const halftimeDurationSeconds = Number.isFinite(Number(config.halftimeDurationSeconds))
        ? Number(config.halftimeDurationSeconds)
        : parseNumber(config.halftimeDuration, 5, 0, 999) * 60;

    return {
        ...config,
        periodMinutes: parseNumber(config.periodMinutes, Math.floor(periodDurationSeconds / 60), 0, 99),
        periodSeconds: parseNumber(config.periodSeconds, periodDurationSeconds % 60, 0, 59),
        halftimeMinutes: parseNumber(config.halftimeMinutes, Math.floor(halftimeDurationSeconds / 60), 0, 99),
        halftimeSeconds: parseNumber(config.halftimeSeconds, halftimeDurationSeconds % 60, 0, 59),
        periodDurationSeconds,
        halftimeDurationSeconds
    };
};

const formatDuration = (minutes, seconds) => {
    const safeMinutes = parseNumber(minutes, 0, 0, 99);
    const safeSeconds = parseNumber(seconds, 0, 0, 59);
    return `${safeMinutes}:${safeSeconds.toString().padStart(2, '0')}`;
};

const ConfigPage = () => {
    const { config, setConfig } = useContext(ConfigContext);
    const [localConfig, setLocalConfig] = useState(() => normalizeConfigForEditing(config));
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { id, value, type, checked } = e.target;
        setLocalConfig(prevConfig => ({
            ...prevConfig,
            [id]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSave = () => {
        const requestedPeriodMinutes = parseNumber(localConfig.periodMinutes, 20, 0, 99);
        const requestedPeriodSeconds = parseNumber(localConfig.periodSeconds, 0, 0, 59);
        const requestedHalftimeMinutes = parseNumber(localConfig.halftimeMinutes, 5, 0, 99);
        const requestedHalftimeSeconds = parseNumber(localConfig.halftimeSeconds, 0, 0, 59);
        const periodDurationSeconds = Math.max(1, (requestedPeriodMinutes * 60) + requestedPeriodSeconds);
        const halftimeDurationSeconds = Math.max(0, (requestedHalftimeMinutes * 60) + requestedHalftimeSeconds);
        const periodMinutes = Math.floor(periodDurationSeconds / 60);
        const periodSeconds = periodDurationSeconds % 60;
        const halftimeMinutes = Math.floor(halftimeDurationSeconds / 60);
        const halftimeSeconds = halftimeDurationSeconds % 60;

        const newConfig = {
            ...localConfig,
            periodMinutes,
            periodSeconds,
            halftimeMinutes,
            halftimeSeconds,
            periodDuration: periodMinutes,
            halftimeDuration: halftimeMinutes,
            periodDurationSeconds,
            halftimeDurationSeconds,
            halftimeAfterPeriod: parseNumber(localConfig.halftimeAfterPeriod, 1, 1, 99),
            totalPeriods: parseNumber(localConfig.totalPeriods, 2, 1, 4)
        };

        setConfig(newConfig);
        navigate('/display');
    };

    const handleResetDefaults = () => {
        setLocalConfig(DEFAULT_CONFIG);
    };

    return (
        <div className="config-container">
            <div className="config-header">
                <h1>Configuración del Tablero</h1>
                <p>Personaliza equipos, tiempos y visualización antes de iniciar el partido.</p>
            </div>

            <div className="config-section">
                <h2>Equipos</h2>
                <div className="team-config-grid">
                    <div className="team-config-card">
                        <h3>Local</h3>
                        <div className="input-group">
                            <label htmlFor="homeTeam">Nombre del equipo</label>
                            <input
                                type="text"
                                id="homeTeam"
                                value={localConfig.homeTeam}
                                onChange={handleChange}
                                placeholder="Ej: Pacífico"
                            />
                        </div>
                        <div className="input-group input-row">
                            <div className="field-grow">
                                <label htmlFor="homeLogo">Logo</label>
                                <select id="homeLogo" value={localConfig.homeLogo} onChange={handleChange}>
                                    <option value="">Sin logo</option>
                                    {logoList.map(logo => (
                                        <option key={logo.path} value={logo.path}>{logo.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="field-color">
                                <label htmlFor="homeColor">Color</label>
                                <input type="color" id="homeColor" value={localConfig.homeColor} onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    <div className="team-config-card">
                        <h3>Visitante</h3>
                        <div className="input-group">
                            <label htmlFor="awayTeam">Nombre del equipo</label>
                            <input
                                type="text"
                                id="awayTeam"
                                value={localConfig.awayTeam}
                                onChange={handleChange}
                                placeholder="Ej: O'Higgins"
                            />
                        </div>
                        <div className="input-group input-row">
                            <div className="field-grow">
                                <label htmlFor="awayLogo">Logo</label>
                                <select id="awayLogo" value={localConfig.awayLogo} onChange={handleChange}>
                                    <option value="">Sin logo</option>
                                    {logoList.map(logo => (
                                        <option key={logo.path} value={logo.path}>{logo.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="field-color">
                                <label htmlFor="awayColor">Color</label>
                                <input type="color" id="awayColor" value={localConfig.awayColor} onChange={handleChange} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="config-section">
                <h2>Temporizador</h2>
                <div className="timer-config-grid">
                    <div className="input-group">
                        <label>Duración de cada período</label>
                        <div className="input-row">
                            <div className="field-grow">
                                <label htmlFor="periodMinutes">Minutos</label>
                                <input type="number" id="periodMinutes" min="0" max="99" value={localConfig.periodMinutes} onChange={handleChange} />
                            </div>
                            <div className="field-grow">
                                <label htmlFor="periodSeconds">Segundos</label>
                                <input type="number" id="periodSeconds" min="0" max="59" value={localConfig.periodSeconds} onChange={handleChange} />
                            </div>
                        </div>
                    </div>
                    <div className="input-group timer-align-bottom">
                        <label htmlFor="totalPeriods">Cantidad de períodos</label>
                        <select id="totalPeriods" value={localConfig.totalPeriods} onChange={handleChange}>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                        </select>
                    </div>
                    <div className="input-group">
                        <label>Duración del entretiempo</label>
                        <div className="input-row">
                            <div className="field-grow">
                                <label htmlFor="halftimeMinutes">Minutos</label>
                                <input type="number" id="halftimeMinutes" min="0" max="99" value={localConfig.halftimeMinutes} onChange={handleChange} />
                            </div>
                            <div className="field-grow">
                                <label htmlFor="halftimeSeconds">Segundos</label>
                                <input type="number" id="halftimeSeconds" min="0" max="59" value={localConfig.halftimeSeconds} onChange={handleChange} />
                            </div>
                        </div>
                    </div>
                    <div className="input-group timer-align-bottom">
                        <label htmlFor="halftimeAfterPeriod">Iniciar entretiempo después del período</label>
                        <input type="number" id="halftimeAfterPeriod" min="1" max="99" value={localConfig.halftimeAfterPeriod} onChange={handleChange} />
                    </div>
                </div>
            </div>

            <div className="config-section">
                <h2>Opciones de Visualización</h2>
                <div className="toggle-row">
                    <label htmlFor="showPeriod">Mostrar número de período</label>
                    <input type="checkbox" id="showPeriod" checked={localConfig.showPeriod} onChange={handleChange} />
                </div>
                <div className="toggle-row">
                    <label htmlFor="showTimer">Mostrar reloj principal</label>
                    <input type="checkbox" id="showTimer" checked={localConfig.showTimer} onChange={handleChange} />
                </div>
            </div>

            <div className="config-summary">
                <strong>Resumen:</strong>
                <span>{localConfig.homeTeam} vs {localConfig.awayTeam}</span>
                <span>{localConfig.totalPeriods} períodos de {formatDuration(localConfig.periodMinutes, localConfig.periodSeconds)}</span>
                <span>Entretiempo: {formatDuration(localConfig.halftimeMinutes, localConfig.halftimeSeconds)} (tras período {localConfig.halftimeAfterPeriod})</span>
            </div>

            <div className="config-actions">
                <button onClick={handleResetDefaults} className="btn-secondary">Restaurar valores sugeridos</button>
                <button onClick={handleSave} className="btn-save">Guardar y Ver Tablero</button>
            </div>
        </div>
    );
};

export default ConfigPage;
