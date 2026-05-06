// ============================================================
// NusaWeather — src/contexts/UnitsContext.tsx
// ============================================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { PressureUnit, TempUnit, WindUnit } from '../types';

const KEYS = {
  TEMP: '@nusa_unit_temp',
  WIND: '@nusa_unit_wind',
  PRESSURE: '@nusa_unit_pressure',
};

interface UnitsContextType {
  tempUnit: TempUnit;
  windUnit: WindUnit;
  pressureUnit: PressureUnit;
  setTempUnit: (u: TempUnit) => void;
  setWindUnit: (u: WindUnit) => void;
  setPressureUnit: (u: PressureUnit) => void;
}

const UnitsContext = createContext<UnitsContextType>({
  tempUnit: 'celsius',
  windUnit: 'ms',
  pressureUnit: 'hpa',
  setTempUnit: () => {},
  setWindUnit: () => {},
  setPressureUnit: () => {},
});

export const UnitsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tempUnit, setTempState] = useState<TempUnit>('celsius');
  const [windUnit, setWindState] = useState<WindUnit>('ms');
  const [pressureUnit, setPressureState] = useState<PressureUnit>('hpa');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(KEYS.TEMP),
      AsyncStorage.getItem(KEYS.WIND),
      AsyncStorage.getItem(KEYS.PRESSURE),
    ]).then(([t, w, p]) => {
      if (t) setTempState(t as TempUnit);
      if (w) setWindState(w as WindUnit);
      if (p) setPressureState(p as PressureUnit);
      setReady(true);
    });
  }, []);

  const setTempUnit = (u: TempUnit) => {
    setTempState(u);
    AsyncStorage.setItem(KEYS.TEMP, u);
  };

  const setWindUnit = (u: WindUnit) => {
    setWindState(u);
    AsyncStorage.setItem(KEYS.WIND, u);
  };

  const setPressureUnit = (u: PressureUnit) => {
    setPressureState(u);
    AsyncStorage.setItem(KEYS.PRESSURE, u);
  };

  const value = useMemo(
    () => ({ tempUnit, windUnit, pressureUnit, setTempUnit, setWindUnit, setPressureUnit }),
    [tempUnit, windUnit, pressureUnit]
  );

  if (!ready) return null;

  return <UnitsContext.Provider value={value}>{children}</UnitsContext.Provider>;
};

export const useUnits = () => useContext(UnitsContext);