import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getUiVersionFromCopilotView } from "./CopilotNavDropdown.jsx";
import { getCopilotTheme } from "./strategyCopilotUi.js";
import { INITIAL_WORKSTATION_STRATEGIES } from "./strategyWorkstationMockData.js";

const StrategyCopilotContext = createContext(null);

const DEFAULT_STRATEGY_ID = "strat-btc-sniper";

export function StrategyCopilotProvider({ children, copilotView }) {
  const [strategies, setStrategies] = useState(INITIAL_WORKSTATION_STRATEGIES);
  const [selectedStrategyId, setSelectedStrategyId] = useState(DEFAULT_STRATEGY_ID);
  const [activityLog, setActivityLog] = useState([]);
  const [lastSetup, setLastSetup] = useState(null);
  const [uiVersion, setUiVersion] = useState(() =>
    getUiVersionFromCopilotView(copilotView),
  );

  useEffect(() => {
    setUiVersion(getUiVersionFromCopilotView(copilotView));
  }, [copilotView]);

  const appendLog = useCallback((message, meta = {}) => {
    setActivityLog((prev) =>
      [
        {
          id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          message,
          at: new Date().toISOString(),
          ...meta,
        },
        ...prev,
      ].slice(0, 80),
    );
  }, []);

  const value = useMemo(
    () => ({
      strategies,
      setStrategies,
      selectedStrategyId,
      setSelectedStrategyId,
      activityLog,
      lastSetup,
      setLastSetup,
      appendLog,
      uiVersion,
      setUiVersion,
      theme: getCopilotTheme(uiVersion),
    }),
    [
      strategies,
      selectedStrategyId,
      activityLog,
      lastSetup,
      appendLog,
      uiVersion,
    ],
  );

  return (
    <StrategyCopilotContext.Provider value={value}>
      {children}
    </StrategyCopilotContext.Provider>
  );
}

export function useStrategyCopilot() {
  const ctx = useContext(StrategyCopilotContext);
  if (!ctx) {
    throw new Error("useStrategyCopilot must be used within StrategyCopilotProvider");
  }
  return ctx;
}

/** @returns {ReturnType<typeof getCopilotTheme>} */
export function useCopilotTheme() {
  const { theme } = useStrategyCopilot();
  return theme;
}
