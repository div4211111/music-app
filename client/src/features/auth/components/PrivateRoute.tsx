import React from "react";
import { RouteProps } from "react-router";
import { Redirect, Route } from "react-router-dom";

import { useUser } from "../hooks/useUser";

export function PrivateRoute({
  children,
  ...rest
}: React.PropsWithChildren<RouteProps>): React.ReactElement {
  const { user } = useUser();

  return (
    <Route
      {...rest}
      render={({ location }: { location: Location }) =>
        user ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: "/signin",
              state: { from: location },
            }}
          />
        )
      }
    />
  );
}
