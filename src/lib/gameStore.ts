// In-memory game state for active game recording
interface GameState {
  isActive: boolean;
  gameId: string | null;
  teamAPlayers: string[];
  teamBPlayers: string[];
  teamAKeeper: string | null;
  teamBKeeper: string | null;
  events: Array<{
    type: 'goal' | 'assist';
    playerId: string;
    timestamp: Date;
  }>;
}

let gameState: GameState = {
  isActive: false,
  gameId: null,
  teamAPlayers: [],
  teamBPlayers: [],
  teamAKeeper: null,
  teamBKeeper: null,
  events: [],
};

export const getGameState = () => gameState;

export const startGame = (
  gameId: string,
  teamAPlayers: string[],
  teamBPlayers: string[],
  teamAKeeper: string,
  teamBKeeper: string
) => {
  gameState = {
    isActive: true,
    gameId,
    teamAPlayers,
    teamBPlayers,
    teamAKeeper,
    teamBKeeper,
    events: [],
  };
};

export const addEvent = (type: 'goal' | 'assist', playerId: string) => {
  gameState.events.push({
    type,
    playerId,
    timestamp: new Date(),
  });
};

export const getGameEvents = () => gameState.events;

export const endGame = () => {
  const finalState = { ...gameState };
  gameState = {
    isActive: false,
    gameId: null,
    teamAPlayers: [],
    teamBPlayers: [],
    teamAKeeper: null,
    teamBKeeper: null,
    events: [],
  };
  return finalState;
};

export const isGameActive = () => gameState.isActive;
