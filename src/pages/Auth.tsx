import { useEffect, useState } from "react";
import { useStoreActions, useStoreState } from "../store";
import { useNavigate } from "react-router-dom";

function Auth() {
  const authenticate = useStoreActions((actions) => actions.authenticate);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    authenticate().then((val) => {
      if (val.authenticated) {
        navigate("/");
      } else {
        setError(val.errorMessage || "");
      }
    });
  }, [authenticate]);

  return <div>{error && <div>{error}</div>}</div>;
}

export default Auth;
