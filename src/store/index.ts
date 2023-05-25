import {
  Action,
  Thunk,
  action,
  createStore,
  createTypedHooks,
  thunk,
} from "easy-peasy";
import authenticate from "./authenticate";
import { AccessContext, OAuth2AuthCodePKCE } from "@bity/oauth2-auth-code-pkce";

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
}

const lichessHost = "https://lichess.org";
const scopes = ["email:read"];
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
});

const typedHooks = createTypedHooks<EPStore>();

export default store;

export const useStoreActions = typedHooks.useStoreActions;
export const useStoreDispatch = typedHooks.useStoreDispatch;
export const useStoreState = typedHooks.useStoreState;
