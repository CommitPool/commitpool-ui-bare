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
  const { currentUser, setCurrentUser } = useCurrentUser();
  const { commitment, setCommitment } = useCommitPool();

  console.log("Athlete in context: ", athlete)

  const handleStravaLogin = async () => {
    athlete?.id ? await logOutAndClearState() : await stravaOauth();
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
    if (athlete?.refresh_token) {
      const config: RevokeTokenRequestConfig = { token: athlete.refresh_token };

      await revokeAsync(config, discovery);
    }

    setAthlete(undefined);
  };

  const stravaOauth = async () => {
    await promptAsync();
  };

  //Get strava auth code from oauth response, get and set athlete data
  useEffect(() => {
    if (response?.type === "success" && response.params?.code) {
      const authCode: string = response.params.code;
      executeLoginAndSetAthlete(authCode);
    }
  }, [response]);

  //Post strava user to db
  useEffect(() => {
    if (athlete) {
      console.log("Posting athlete to DB");
      storeAthleteInDb(athlete);
    }

    // if (athlete?.refresh_token) {
    //   const getAccessToken = async () => {
    //     await axios({
    //       baseURL: discovery.tokenEndpoint,
    //       method: "post",
    //       headers: {
    //         "Content-Type": "application/json",
    //       },
    //       data: {
    //         client_id: clientID,
    //         client_secret: clientSecret,
    //         refresh_token: athlete?.refresh_token,
    //         grant_type: "refresh_token",
    //       },
    //     })
    //       .then(async (response) => {
    //         console.log("Auth response from refresh flow: ", response);
    //         console.log("Strava login data from refresh flow: ", response.data);
    //         if (response.data?.access_token) {
    //           setAthlete({
    //             ...athlete,
    //             access_token: response.data.access_token,
    //           });
    //         }
    //       })
    //       .catch((error) => {
    //         console.log(
    //           "Error getting login data using refresh token: ",
    //           error
    //         );
    //       });
    //   };

    //   getAccessToken();
    // }
  }, [athlete]);

  const storeAthleteInDb = async (athlete: Athlete) => {
    await axios({
      url: "https://test2.dcl.properties/user",
      method: "post",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      data: {
        address: athlete.id,
        token: athlete.refresh_token,
      },
    })
      .then((response) => {
        console.log("Athlete data posted to db: ", response.data);
      })
      .catch((error) => console.log("Error posting athlete to db: ", error));
  };

  const executeLoginAndSetAthlete = async (authCode: string) => {
    console.log("Getting athlete data");

    await axios({
      method: "post",
      baseURL: discovery.tokenEndpoint,
      params: {
        client_id: clientID,
        client_secret: clientSecret,
        code: authCode,
        grant_type: "authorization_code",
      },
    })
      .then(async (response) => {
        const athleteData = response.data.athlete;
        const { refresh_token, access_token } = response.data
        setAthlete({...response.data.athlete, refresh_token, access_token});

        if (athleteData.username || athleteData.firstname) {
          setCurrentUser({ ...currentUser, username: athleteData.username || athleteData.firstname});
        }
      })
      .catch((error) => {
        console.log("Error getting athlete data: ", error);
      });
  };

  // const getAthleteData = async (athlete: Athlete) => {
  //   await axios({
  //     baseURL: "https://www.strava.com/api/v3/athlete",
  //     method: "get",
  //     headers: {
  //       "Content-Type": "application/json",
  //       Authorization: `Bearer: ${athlete.access_token}`,
  //     },
  //   })
  //     .then(async (response) => {
  //       console.log("Auth response from access token flow: ", response);
  //       console.log(
  //         "Strava login data from access token flow: ",
  //         response.data
  //       );
  //       setAthlete(response.data.access_token);
  //     })
  //     .catch((error) => {
  //       console.log("Error getting login data using access token: ", error);
  //     });
  // };

  useEffect(() => {
    if (athlete && commitment?.goalValue) {
      if (commitment.goalValue) {
        getAthleteActivityData(commitment, athlete.access_token).then(
          (total) => {
            console.log(
              `total: ${total}, goalValue: ${
                commitment.goalValue
              } , progress: ${
                commitment.goalValue
                  ? (total / 100 / commitment.goalValue) * 100
                  : "undefined"
              }`
            );
            const progress = commitment.goalValue
              ? (total / 100 / commitment.goalValue) * 100
              : 0;

              if(commitment.progress !== progress){
                setCommitment({ ...commitment, progress });
              }
            }
          
        );
      }

  }}, [athlete, commitment]);

  //TODO axios this up
  const getAthleteActivityData = async (
    commitment: Partial<Commitment>,
    accessToken: string
  ) => {
    return fetch(
      "https://test2.dcl.properties/activities?startTime=" +
        commitment.startTime +
        "&endTime=" +
        commitment.endTime +
        "&type=" +
        commitment.activityName +
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
