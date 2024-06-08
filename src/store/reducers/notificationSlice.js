import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  message: null,
  messageType: null,
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    showMessage: (state, action) => {
      state.message = action.payload.message;
      state.messageType = action.payload.messageType;
    },
    clearMessage: (state) => {
      state.message = null;
      state.messageType = null;
    },
  },
});

export const { showMessage, clearMessage } = notificationSlice.actions;

export const selectMessage = (state) => state.notification.message;

export const selectMessageType = (state) => state.notification.messageType;

export default notificationSlice.reducer;
