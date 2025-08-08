import React, { createContext, useState, useEffect } from 'react';

export const ConfigContext = createContext();

export const ConfigProvider = ({ children }) => {
    const [config, setConfig] = useState(() => {
        try {
            const savedConfig = localStorage.getItem('hockeyScoreboardConfig');
            return savedConfig ? JSON.parse(savedConfig) : null;
        } catch (error) {
            console.error('Error parsing config from localStorage', error);
            return null;
        }
    });

    useEffect(() => {
        if (config) {
            try {
                localStorage.setItem('hockeyScoreboardConfig', JSON.stringify(config));
            } catch (error) {
                console.error('Error saving config to localStorage', error);
            }
        }
    }, [config]);

    const defaultConfig = {
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
        halftimeDuration: 5,
        halftimeAfterPeriod: 1
    };

    const currentConfig = config || defaultConfig;

    return (
        <ConfigContext.Provider value={{ config: currentConfig, setConfig }}>
            {children}
        </ConfigContext.Provider>
    );
};
