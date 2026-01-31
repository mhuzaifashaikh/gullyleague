// In-memory game state for active game recording
interface GameState {
  isActive: boolean;
  gameId: string | null;
  startedAt: Date | null;
  teamAPlayers: string[];
  teamBPlayers: string[];
  teamAKeeper: string | null;
  teamBKeeper: string | null;
  events: Array<{
    type: 'goal' | 'assist';
    playerId: string;
    minute: number;
    timestamp: Date;
  }>;
}

let gameState: GameState = {
  isActive: false,
  gameId: null,
  startedAt: null,
  teamAPlayers: [],
  teamBPlayers: [],
  teamAKeeper: null,
  teamBKeeper: null,
  events: [],
};

export const getGameState = () => gameState;

export const getGameMinute = (): number => {
  if (!gameState.startedAt) return 0;
  const elapsed = Date.now() - gameState.startedAt.getTime();
  return Math.floor(elapsed / 60000); // Convert ms to minutes
};

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
    startedAt: new Date(),
    teamAPlayers,
    teamBPlayers,
    teamAKeeper,
    teamBKeeper,
    events: [],
  };
};

export const addEvent = (type: 'goal' | 'assist', playerId: string) => {
  const minute = getGameMinute();
  gameState.events.push({
    type,
    playerId,
    minute,
    timestamp: new Date(),
  });
};

export const getGameEvents = () => gameState.events;

export const endGame = () => {
  const finalState = { ...gameState };
  gameState = {
    isActive: false,
    gameId: null,
    startedAt: null,
    teamAPlayers: [],
    teamBPlayers: [],
    teamAKeeper: null,
    teamBKeeper: null,
    events: [],
  };
  return finalState;
};

export const isGameActive = () => gameState.isActive;
