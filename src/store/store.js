import { configureStore } from "@reduxjs/toolkit";
import notificationReducer from "./reducers/notificationSlice";

export const store = configureStore({
  reducer: {
    notification: notificationReducer,
  },
});
