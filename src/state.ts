// ============================================================================
// STATE — Simple state management
// ============================================================================

export interface AppState {
  currentRoute: string;
  activeProjectId: string;
  activeExperimentId: string | null;
}

class StateManager {
  private state: AppState = {
    currentRoute: '/',
    activeProjectId: 'p01',
    activeExperimentId: null,
  };

  private listeners: Set<(state: AppState) => void> = new Set();

  getState(): AppState {
    return { ...this.state };
  }

  setState(partial: Partial<AppState>): void {
    this.state = { ...this.state, ...partial };
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

  setActiveProject(id: string): void {
    this.setState({ activeProjectId: id });
  }

  setActiveExperiment(id: string | null): void {
    this.setState({ activeExperimentId: id });
  }
}

export const state = new StateManager();
