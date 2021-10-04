import { combineReducers, Reducer } from "redux";

import transactionReducer from "./transactions/transactionSlice";

const rootReducer: Reducer = combineReducers({
  transactions: transactionReducer,
});

export default rootReducer;
