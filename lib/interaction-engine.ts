import type { BuildScreenAction } from "@/types";

interface InteractionState {
  currentIndex: number;
  maxIndex: number;
  history: number[];
  uiState: Record<string, boolean>;
}

interface InteractionResult {
  currentIndex: number;
  history: number[];
  uiState: Record<string, boolean>;
}

export function applyBuildInteraction(
  action: BuildScreenAction,
  snapshot: InteractionState
): InteractionResult {
  if (action.intent === "next") {
    const nextIndex = Math.min(snapshot.currentIndex + 1, snapshot.maxIndex);
    return {
      currentIndex: nextIndex,
      history: [...snapshot.history, snapshot.currentIndex],
      uiState: snapshot.uiState,
    };
  }

  if (action.intent === "back") {
    const fromHistory = snapshot.history[snapshot.history.length - 1];
    const nextIndex = typeof fromHistory === "number"
      ? fromHistory
      : Math.max(snapshot.currentIndex - 1, 0);
    return {
      currentIndex: nextIndex,
      history: snapshot.history.slice(0, -1),
      uiState: snapshot.uiState,
    };
  }

  if (action.intent === "jump" && typeof action.targetIndex === "number") {
    const bounded = Math.max(0, Math.min(action.targetIndex, snapshot.maxIndex));
    return {
      currentIndex: bounded,
      history: [...snapshot.history, snapshot.currentIndex],
      uiState: snapshot.uiState,
    };
  }

  if (action.intent === "toggle" && action.stateKey) {
    return {
      currentIndex: snapshot.currentIndex,
      history: snapshot.history,
      uiState: {
        ...snapshot.uiState,
        [action.stateKey]: !snapshot.uiState[action.stateKey],
      },
    };
  }

  if (action.intent === "confirm") {
    return {
      currentIndex: snapshot.currentIndex,
      history: snapshot.history,
      uiState: {
        ...snapshot.uiState,
        confirmationComplete: true,
      },
    };
  }

  return {
    currentIndex: snapshot.currentIndex,
    history: snapshot.history,
    uiState: snapshot.uiState,
  };
}
