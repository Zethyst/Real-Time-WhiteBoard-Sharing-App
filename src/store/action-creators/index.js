//!Action creators tell a particular reducer what to do

export const showMessage = (message) => ({
  type: 'notification/showMessage',
  payload: message,
});

// In your component, dispatch the action with the custom message
dispatch(showMessage('Custom success message!'));
