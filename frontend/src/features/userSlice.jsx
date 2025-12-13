import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

/* =========================
   🔹 THUNKS CRUD
========================= */

/* FETCH */
export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const res = await fetch("http://localhost:3000/api/users/drivers", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      console.log("get users", res);
      if (!res.ok) throw new Error("Erreur lors du chargement des utilisateurs");
      const data = await res.json();
      return data.data || [];
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/* CREATE */
export const createUser = createAsyncThunk(
  "users/createUser",
  async (userData, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const res = await fetch("http://localhost:3000/api/users/drivers", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(userData),
      });
      if (!res.ok) throw new Error("Erreur création utilisateur");
      const data = await res.json();
      return data.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/* UPDATE PASSWORD*/
export const updatePassword = createAsyncThunk(
  "users/updatePassword",
  async ({ id, password }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const res = await fetch(`http://localhost:3000/api/users/drivers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) throw new Error("Erreur mise à jour mot de passe");
      const data = await res.json();
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
)

/* DELETE */
export const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async (id, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const res = await fetch(`http://localhost:3000/api/users/drivers/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erreur suppression utilisateur");
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/* =========================
   🔹 SLICE
========================= */
const initialState = {
  list: [],
  selectedUser: null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    selectUser: (state, action) => { state.selectedUser = action.payload; },
    clearSelectedUser: (state) => { state.selectedUser = null; },
  },
  extraReducers: (builder) => {
    builder
      // FETCH
      .addCase(fetchUsers.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchUsers.fulfilled, (state, action) => { state.loading = false; state.list = action.payload; })
      .addCase(fetchUsers.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      // CREATE
      .addCase(createUser.fulfilled, (state, action) => { state.list.push(action.payload); })
      .addCase(createUser.rejected, (state, action) => { state.error = action.payload; })

      // DELETE
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.list = state.list.filter(u => u._id !== action.payload);
        if (state.selectedUser && state.selectedUser._id === action.payload) state.selectedUser = null;
      })
      .addCase(deleteUser.rejected, (state, action) => { state.error = action.payload; });
  }
});

export const { selectUser, clearSelectedUser } = userSlice.actions;
export default userSlice.reducer;
