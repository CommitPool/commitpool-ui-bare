import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "../redux/store";
import axios from "axios";

import * as WebBrowser from "expo-web-browser";
import {
  makeRedirectUri,
  useAuthRequest,
  DiscoveryDocument,
  revokeAsync,
  RevokeTokenRequestConfig,
  AuthSessionResult,
} from "expo-auth-session";

import {
  logInStravaUser,
  logOutStravaUser,
  updateAccessToken,
} from "../redux/strava/stravaSlice";

WebBrowser.maybeCompleteAuthSession();

//Strava Credentials
const clientID: string = "66714&";
const clientSecret: string = "6b5e8c4fd9bb841d1e8d9be15020dab2017607e4";

// Strava Endpoints
const discovery: DiscoveryDocument = {
  authorizationEndpoint: "https://www.strava.com/oauth/mobile/authorize",
  tokenEndpoint: "https://www.strava.com/oauth/token",
  revocationEndpoint: "https://www.strava.com/oauth/deauthorize",
};

// endpoint for read-all activities. temporary token is added in getActivities()
// const callActivities = `https://www.strava.com/api/v3/athlete/activities?access_token=`;

const useStravaAthlete = () => {
  const dispatch = useAppDispatch();

  const {
    isLoggedIn: stravaIsLoggedIn,
    athlete,
    refresh_token: refreshToken,
    access_token: accessToken,
  }: {
    isLoggedIn: boolean;
    refresh_token: string;
    access_token: string;
    athlete: Athlete;
  } = useSelector((state: RootState) => state.strava);

  const handleStravaLogin = () => {
    stravaIsLoggedIn ? logOutAndClearState() : stravaOauth();
  };

  const logOutAndClearState = async () => {
    if (refreshToken) {
      const config: RevokeTokenRequestConfig = { token: refreshToken };

      await revokeAsync(config, discovery);

      dispatch(logOutStravaUser({}));
    }
  };

  const stravaOauth = async () => {
    await promptAsync();
  };

  //Strava login
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: clientID,
      scopes: ["read,activity:read"],
      // For usage in managed apps using the proxy
      redirectUri: makeRedirectUri({
        // For usage in bare and standalone
        // the "redirect" must match your "Authorization Callback Domain" in the Strava dev console.
        native: "your.app://redirect",
      }),
    },
    discovery
  );

  //Set strava Code from response
  useEffect(() => {
    console.log("Response: ", response);
    if (response?.type === "success") {
      const executeLogin = async () => {
        await axios({
          method: "post",
          baseURL: discovery.tokenEndpoint,
          params: {
            client_id: clientID,
            client_secret: clientSecret,
            code: response.params.code,
            grant_type: "authorization_code",
          },
        })
          .then(async (response) => {
            console.log("Auth response: ", response);
            console.log("Strava login data: ", response.data);
            dispatch(logInStravaUser(response.data));
          })
          .catch((error) => {
            console.log("Error getting login data: ", error);
          });
      };
      executeLogin();
    }
  }, [response]);

  //Post strava user to db
  useEffect(() => {
    if (stravaIsLoggedIn && athlete && refreshToken) {
      const createUser = async () => {
        await axios({
          url: "https://test2.dcl.properties/user",
          method: "post",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          data: {
            address: athlete.id,
            token: refreshToken,
          },
        })
          .then((response) => {
            console.log("Strava user data posted to db: ", response.data);
          })
          .catch((error) =>
            console.log("Error posting strava user data to db: ", error)
          );
      };

      createUser();
    }
  }, [stravaIsLoggedIn, athlete, refreshToken]);

  //Refresh accessToken when refresh token in state
  useEffect(() => {
    const getAccessToken = async () => {
      await axios({
        baseURL: discovery.tokenEndpoint,
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        data: {
          client_id: clientID,
          client_secret: clientSecret,
          refresh_token: refreshToken,
          grant_type: "refresh_token",
        },
      })
        .then(async (response) => {
          console.log("Auth response from refresh flow: ", response);
          console.log("Strava login data from refresh flow: ", response.data);
          dispatch(updateAccessToken(response.data.access_token));
        })
        .catch((error) => {
          console.log("Error getting login data using refresh token: ", error);
        });
    };

    if (refreshToken) {
      console.log("Trying to use refresh token");
      getAccessToken();
    }
  }, [refreshToken]);

  //Refresh accessToken when refresh token in state
  useEffect(() => {
    const getAthleteData = async () => {
      await axios({
        baseURL: "https://www.strava.com/api/v3/athlete",
        method: "get",
        headers: {
          Authorization: `${accessToken}`,
        },
      })
        .then(async (response) => {
          console.log("Auth response from access token flow: ", response);
          console.log(
            "Strava login data from access token flow: ",
            response.data
          );
          dispatch(updateAccessToken(response.data.access_token));
        })
        .catch((error) => {
          console.log("Error getting login data using access token: ", error);
        });
    };

    if (accessToken && !stravaIsLoggedIn) {
      console.log("Trying to use access token");
      getAthleteData();
    }
  }, [accessToken]);

  return { athlete, accessToken, stravaIsLoggedIn, handleStravaLogin };
};

export default useStravaAthlete;
