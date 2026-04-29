import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: [],
  reducers: {
    addUser(state, action) {
      state.push({
        id: action.payload.id,
        text: action.payload.text,
        completed: false,
      });
    },
  },
});

export const { addUser } = userSlice.actions;
export default userSlice.reducer;
