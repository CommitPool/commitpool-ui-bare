import React, { createContext, useContext, useEffect, useState } from "react";
import { Athlete, Commitment } from "../types";

import * as WebBrowser from "expo-web-browser";
import {
  makeRedirectUri,
  useAuthRequest,
  revokeAsync,
  RevokeTokenRequestConfig,
  DiscoveryDocument,
} from "expo-auth-session";
import axios from "axios";
import { useCurrentUser } from "./currentUserContext";
import { useCommitPool } from "./commitPoolContext";

//Strava Credentials
const clientID: string = "66714&";
const clientSecret: string = "6b5e8c4fd9bb841d1e8d9be15020dab2017607e4";

// Strava Endpoints
const discovery: DiscoveryDocument = {
  authorizationEndpoint: "https://www.strava.com/oauth/mobile/authorize",
  tokenEndpoint: "https://www.strava.com/oauth/token",
  revocationEndpoint: "https://www.strava.com/oauth/deauthorize",
};

type StravaContextType = {
  athlete?: Athlete;
  handleStravaLogin: () => void;
};

export const StravaContext = createContext<StravaContextType>({
  athlete: undefined,
  handleStravaLogin: () => {},
});

interface StravaProps {
  children: any;
}

WebBrowser.maybeCompleteAuthSession();

export const StravaContextProvider: React.FC<StravaProps> = ({
  children,
}: StravaProps) => {
  const [athlete, setAthlete] = useState<Athlete>();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [refreshToken, setRefreshToken] = useState<any>();
  const [accessToken, setAccessToken] = useState<any>();
  const { currentUser, setCurrentUser } = useCurrentUser();
  const { commitment } = useCommitPool();
  const handleStravaLogin = () => {
    isLoggedIn ? logOutAndClearState() : stravaOauth();
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

  const logOutAndClearState = async () => {
    if (refreshToken) {
      const config: RevokeTokenRequestConfig = { token: refreshToken };

      await revokeAsync(config, discovery);
      setRefreshToken(undefined);
      setAccessToken(undefined);
    }
  };

  const stravaOauth = async () => {
    await promptAsync();
  };

  //Set strava Code from response
  useEffect(() => {
    console.log("Response: ", response);
    if (response?.type === "success") {
      executeLoginAndSetAthlete(response);
    }
  }, [response]);

  //Post strava user to db
  useEffect(() => {
    if (athlete && refreshToken) {
      console.log("Athlete: ", athlete)
      storeAthleteInDb(athlete, refreshToken);
    }
  }, [athlete, refreshToken]);

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
          setAccessToken(response.data.access_token);
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
    
    if (accessToken && !isLoggedIn) {
      console.log("Trying to use access token for getting athlete");
      getAthleteData();
    }
  }, [accessToken]);

  const storeAthleteInDb = async (athlete: Athlete, refreshToken: string) => {
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

  const executeLoginAndSetAthlete = async (response: any) => {
    if (response?.params.code) {
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
          setAthlete(response.data);
        })
        .catch((error) => {
          console.log("Error getting login data: ", error);
        });
    }
  };

  const getAthleteData = async () => {
    await axios({
      baseURL: "https://www.strava.com/api/v3/athlete",
      method: "get",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer: ${accessToken}`,
      },
    })
      .then(async (response) => {
        console.log("Auth response from access token flow: ", response);
        console.log(
          "Strava login data from access token flow: ",
          response.data
        );
        setAccessToken(response.data.access_token);
      })
      .catch((error) => {
        console.log("Error getting login data using access token: ", error);
      });
  };

  const getAthleteActivityData = async (
    commitment: Commitment,
    accessToken: string,
    activityName: string
  ) => {
    return fetch(
      "https://test2.dcl.properties/activities?startTime=" +
        commitment.startTime +
        "&endTime=" +
        commitment.endTime +
        "&type=" +
        activityName +
        "&accessToken=" +
        accessToken,
      {
        method: "GET",
        headers: {
          // "Content-Type": "application/json",
          Authorization: "Bearer: " + accessToken,
        },
      }
    )
      .then((res) => res.json())
      .then((json) => {
        return json.total;
      });
  };

  if (accessToken && commitment && activityName !== "") {
    getActivity(commitment, accessToken, activityName).then((total) => {
      console.log(total, commitment.goalValue, total / commitment.goalValue);
      const _progress = (((total / 100) / commitment.goalValue) * 100) | 0;
      setProgress(_progress);
    });
  }


  return (
    <StravaContext.Provider value={{ athlete, handleStravaLogin }}>
      {children}
    </StravaContext.Provider>
  );
};

export const useStrava = () => {
  const { athlete, handleStravaLogin } = useContext(StravaContext);
  return { athlete, handleStravaLogin };
};
