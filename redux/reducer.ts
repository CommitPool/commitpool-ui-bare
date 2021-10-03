import { combineReducers, Reducer } from "redux";

import commitpoolReducer from "./commitpool/commitpoolSlice";
import stravaReducer from "./strava/stravaSlice";
import transactionReducer from "./transactions/transactionSlice";

const rootReducer: Reducer = combineReducers({
  commitpool: commitpoolReducer,
  strava: stravaReducer,
  transactions: transactionReducer,
});

export default rootReducer;
