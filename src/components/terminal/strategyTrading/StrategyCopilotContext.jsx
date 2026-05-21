import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { INITIAL_WORKSTATION_STRATEGIES } from "./strategyWorkstationMockData.js";

const StrategyCopilotContext = createContext(null);

const DEFAULT_STRATEGY_ID = "strat-btc-sniper";

export function StrategyCopilotProvider({ children }) {
  const [strategies, setStrategies] = useState(INITIAL_WORKSTATION_STRATEGIES);
  const [selectedStrategyId, setSelectedStrategyId] = useState(DEFAULT_STRATEGY_ID);
  const [activityLog, setActivityLog] = useState([]);
  const [lastSetup, setLastSetup] = useState(null);

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
    }),
    [
      strategies,
      selectedStrategyId,
      activityLog,
      lastSetup,
      appendLog,
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
