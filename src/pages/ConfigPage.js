import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConfigContext } from '../context/ConfigContext';
import logoList from '../logo-list.json';

const ConfigPage = () => {
    const { config, setConfig } = useContext(ConfigContext);
    const [localConfig, setLocalConfig] = useState(config);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { id, value, type, checked } = e.target;
        setLocalConfig(prevConfig => ({
            ...prevConfig,
            [id]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSave = () => {
        const numericFields = ['periodDuration', 'halftimeDuration', 'halftimeAfterPeriod', 'totalPeriods'];
        const newConfig = { ...localConfig };
        numericFields.forEach(field => {
            newConfig[field] = parseInt(newConfig[field], 10);
        });

        setConfig(newConfig);
        navigate('/display');
    };

    return (
        <div className="config-container">
            <h1>Configuración del Tablero</h1>

            <div className="config-section">
                <h2>Equipos</h2>
                <div className="input-group">
                    <label htmlFor="homeTeam">Equipo Local:</label>
                    <input type="text" id="homeTeam" value={localConfig.homeTeam} onChange={handleChange} />
                </div>
                <div className="input-group">
                    <label htmlFor="homeColor">Color Local:</label>
                    <input type="color" id="homeColor" value={localConfig.homeColor} onChange={handleChange} />
                </div>
                <div className="input-group">
                    <label htmlFor="homeLogo">Logo Local:</label>
                    <select id="homeLogo" value={localConfig.homeLogo} onChange={handleChange}>
                        <option value="">Ninguno</option>
                        {logoList.map(logo => (
                            <option key={logo.path} value={logo.path}>{logo.name}</option>
                        ))}
                    </select>
                </div>
                <div className="input-group">
                    <label htmlFor="awayTeam">Equipo Visitante:</label>
                    <input type="text" id="awayTeam" value={localConfig.awayTeam} onChange={handleChange} />
                </div>
                <div className="input-group">
                    <label htmlFor="awayColor">Color Visitante:</label>
                    <input type="color" id="awayColor" value={localConfig.awayColor} onChange={handleChange} />
                </div>
                <div className="input-group">
                    <label htmlFor="awayLogo">Logo Visitante:</label>
                    <select id="awayLogo" value={localConfig.awayLogo} onChange={handleChange}>
                        <option value="">Ninguno</option>
                        {logoList.map(logo => (
                            <option key={logo.path} value={logo.path}>{logo.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="config-section">
                <h2>Temporizador</h2>
                <div className="input-group">
                    <label htmlFor="periodDuration">Duración del Periodo (min):</label>
                    <input type="number" id="periodDuration" min="1" max="99" value={localConfig.periodDuration} onChange={handleChange} />
                </div>
                <div className="input-group">
                    <label htmlFor="halftimeDuration">Duración del Entretiempo (min):</label>
                    <input type="number" id="halftimeDuration" min="1" max="99" value={localConfig.halftimeDuration} onChange={handleChange} />
                </div>
                <div className="input-group">
                    <label htmlFor="halftimeAfterPeriod">Entretiempo después del Período:</label>
                    <input type="number" id="halftimeAfterPeriod" min="1" max="99" value={localConfig.halftimeAfterPeriod} onChange={handleChange} />
                </div>
                <div className="input-group">
                    <label htmlFor="totalPeriods">Número de Periodos:</label>
                    <select id="totalPeriods" value={localConfig.totalPeriods} onChange={handleChange}>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                    </select>
                </div>
            </div>

            <div className="config-section">
                <h2>Opciones de Visualización</h2>
                <div className="input-group">
                    <label htmlFor="showPeriod">Mostrar Periodo:</label>
                    <input type="checkbox" id="showPeriod" checked={localConfig.showPeriod} onChange={handleChange} />
                </div>
                <div className="input-group">
                    <label htmlFor="showTimer">Mostrar Temporizador:</label>
                    <input type="checkbox" id="showTimer" checked={localConfig.showTimer} onChange={handleChange} />
                </div>
            </div>

            <button onClick={handleSave} className="btn-save">Guardar y Ver Tablero</button>
        </div>
    );
};

export default ConfigPage;
