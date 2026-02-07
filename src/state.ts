// ============================================================================
// STATE — Simple state management for the lite fallback site
// ============================================================================

export interface AppState {
  mode: 'full' | 'lite' | 'auto';
  currentRoute: string;
  activeProjectId: string;
  activeExperimentId: string | null;
  terminalHistory: TerminalLine[];
}

export interface TerminalLine {
  type: 'command' | 'output';
  text: string;
  isSuccess?: boolean;
}

const STORAGE_KEY = 'portfolio_mode';

class StateManager {
  private state: AppState = {
    mode: 'lite', // Default to lite since this IS the lite site
    currentRoute: '/',
    activeProjectId: 'p01',
    activeExperimentId: null,
    terminalHistory: []
  };

  private listeners: Set<(state: AppState) => void> = new Set();

  constructor() {
    this.loadPersistedState();
  }

  private loadPersistedState(): void {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const mode = saved as 'full' | 'lite' | 'auto';
        if (['full', 'lite', 'auto'].includes(mode)) {
          this.state.mode = mode;
        }
      }
    } catch (e) {
      // localStorage not available
    }
  }

  private persistMode(): void {
    try {
      localStorage.setItem(STORAGE_KEY, this.state.mode);
    } catch (e) {
      // localStorage not available
    }
  }

  getState(): AppState {
    return { ...this.state };
  }

  setState(partial: Partial<AppState>): void {
    this.state = { ...this.state, ...partial };
    
    if ('mode' in partial) {
      this.persistMode();
    }

    this.notifyListeners();
  }

  subscribe(listener: (state: AppState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    const stateCopy = this.getState();
    this.listeners.forEach(listener => listener(stateCopy));
  }

  // Terminal specific methods
  addTerminalLine(line: TerminalLine): void {
    this.state.terminalHistory = [...this.state.terminalHistory, line];
    this.notifyListeners();
  }

  clearTerminalHistory(): void {
    this.state.terminalHistory = [];
    this.notifyListeners();
  }

  // Project/Experiment selection
  setActiveProject(id: string): void {
    this.setState({ activeProjectId: id });
  }

  setActiveExperiment(id: string | null): void {
    this.setState({ activeExperimentId: id });
  }
}

export const state = new StateManager();

// ============================================================================
// MODE DETECTION — Check if we should use lite mode
// ============================================================================

export function shouldUseLiteMode(): boolean {
  // Check persisted preference first
  const state = new StateManager().getState();
  if (state.mode === 'lite') return true;
  if (state.mode === 'full') return false;

  // Auto detection
  
  // 1. Check for WebGL support
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return true;
  } catch (e) {
    return true;
  }

  // 2. Check for reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return true;
  }

  // 3. Check screen size (optional mobile default)
  if (window.innerWidth < 900) {
    return true;
  }

  return false;
}
