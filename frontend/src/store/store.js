import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/authSlice";
import truckReducer from "../features/truckSlice";
import trailerReducer from "../features/trailerSlice";
import userReducer from "../features/userSlice";
import pneuReducer from "../features/pneuSlice";
import fuelLogReducer from "../features/fuelLogSlice";
import tripReducer from "../features/tripSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    trucks: truckReducer,
    trailers: trailerReducer,
    users: userReducer ,
    pneus: pneuReducer,
    fuelLog: fuelLogReducer,
    trips: tripReducer, 
  },
});
