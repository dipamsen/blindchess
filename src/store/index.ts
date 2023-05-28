import {
  Action,
  Computed,
  Thunk,
  action,
  computed,
  createStore,
  createTypedHooks,
  thunk,
} from "easy-peasy";
import authenticate from "./authenticate";
import { AccessContext, OAuth2AuthCodePKCE } from "@bity/oauth2-auth-code-pkce";
import Business, { Status } from "../logic/Business";
import { Move } from "chess.js";

export interface GameState {
  moves: Move[];
  turn: "white" | "black";
}

export interface EPStore {
  auth: OAuth2AuthCodePKCE;
  errorMessage: string;
  authenticate: Thunk<
    EPStore,
    undefined,
    any,
    EPStore,
    Promise<{
      authenticated: boolean;
      errorMessage?: string;
    }>
  >;
  setErrorMessage: Action<EPStore, string>;
  userInfo: any;
  setUserInfo: Action<EPStore, any>;
  logout: Thunk<EPStore, undefined, any, EPStore, Promise<void>>;
  business: Business | null;
  setBusiness: Action<EPStore, Business>;
  status: Status;
  setStatus: Action<EPStore, Status>;
  username: string;
  setUsername: Action<EPStore, string>;
  gameState: GameState | null;
  setMoves: Action<EPStore, Move[]>;
  setTurn: Action<EPStore, "white" | "black">;
  movesOrdered: Computed<EPStore, Move[][]>;
  blind: boolean;
  setBlind: Action<EPStore, boolean>;
}

const lichessHost = "https://lichess.org";
const scopes = ["challenge:read", "challenge:write", "board:play"];
const clientId = "devchess.app";
const clientUrl = (() => {
  const url = new URL(location.href);
  url.search = "";
  url.pathname = "/login";
  return url.href;
})();

const store = createStore<EPStore>({
  auth: new OAuth2AuthCodePKCE({
    authorizationUrl: `${lichessHost}/oauth`,
    tokenUrl: `${lichessHost}/api/token`,
    clientId,
    scopes,
    redirectUrl: clientUrl,
    onAccessTokenExpiry: (refreshAccessToken) => refreshAccessToken(),
    onInvalidGrant: (_retry) => {},
  }),
  authenticate,
  errorMessage: "",
  setErrorMessage: action((state, payload) => {
    state.errorMessage = payload;
  }),
  userInfo: {},
  setUserInfo: action((state, payload) => {
    state.userInfo = payload;
  }),
  logout: thunk(async (actions, payload, helpers) => {
    const auth = helpers.getState().auth;
    auth.reset();
  }),
  business: null,
  setBusiness: action((state, payload) => {
    state.business = payload;
  }),
  status: Status.Idle,
  setStatus: action((state, payload) => {
    state.status = payload;
  }),
  username: "",
  setUsername: action((state, payload) => {
    state.username = payload;
  }),
  gameState: {
    moves: [],
    turn: "white",
  },
  setMoves: action((state, payload) => {
    if (state.gameState) state.gameState.moves = payload;
  }),
  setTurn: action((state, payload) => {
    if (state.gameState) state.gameState.turn = payload;
  }),
  movesOrdered: computed((state) => {
    const movesArr: Move[][] = [];
    if (state.gameState) {
      for (const move of state.gameState.moves) {
        if (movesArr.length === 0 && move.color === "b") {
          movesArr.push([
            {
              after: move.before,
              before: move.before,
              color: "w",
              flags: "",
              san: "...",
              lan: "...",
              piece: "k",
              from: "e5",
              to: "e5",
            },
            move,
          ]);
        } else if (move.color === "w") {
          movesArr.push([move]);
        } else {
          movesArr[movesArr.length - 1].push(move);
        }
      }
    } else {
      return [];
    }
    return movesArr;
  }),
  blind: true,
  setBlind: action((state, payload) => {
    state.blind = payload;
  }),
});

const typedHooks = createTypedHooks<EPStore>();

export default store;

export const useStoreActions = typedHooks.useStoreActions;
export const useStoreDispatch = typedHooks.useStoreDispatch;
export const useStoreState = typedHooks.useStoreState;
