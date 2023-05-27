import { action, thunk } from "easy-peasy";
import { EPStore } from ".";
import { OAuth2AuthCodePKCE } from "@bity/oauth2-auth-code-pkce";
import { redirect, useNavigate } from "react-router-dom";

export default thunk<EPStore>(async (actions, payload, helpers) => {
  const oauth = helpers.getState().auth;
  try {
    const hasAuthCode = await oauth.isReturningFromAuthServer();
    if (hasAuthCode) {
      //      console.log("hasAuthCode");
      const token = await oauth.getAccessToken();
      const fetch = oauth.decorateFetchHTTPClient(window.fetch);

      return {
        authenticated: true,
      };
    } else {
      console.log("Redirecting to auth server");
      oauth.fetchAuthorizationCode();
    }
  } catch (error) {
    const e = error as Error;
    console.log(e.toString());
    actions.setErrorMessage(e.toString());
    if (e.toString() === "ErrorInvalidGrant") {
      return {
        authenticated: false,
        errorMessage: "Invalid grant",
      };
    }
  }
  return {
    authenticated: false,
    errorMessage: "Something went wrong.",
  };
});
