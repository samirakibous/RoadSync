import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

/* =========================
   🔹 THUNKS CRUD
========================= */

/* FETCH */
export const fetchPneus = createAsyncThunk(
  "pneus/fetchPneus",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const res = await fetch("http://localhost:3000/api/pneus", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Erreur chargement pneus");
      const data = await res.json();
      return data.data || [];
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/* CREATE */
export const createPneu = createAsyncThunk(
  "pneus/createPneu",
  async (pneuData, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const res = await fetch("http://localhost:3000/api/pneus", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(pneuData),
      });
      if (!res.ok) throw new Error("Erreur création pneu");
      const data = await res.json();
      return data.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/* UPDATE */
export const updatePneu = createAsyncThunk(
  "pneus/updatePneu",
  async ({ id, pneuData }, { getState, rejectWithValue }) => { 
    try {
      const { token } = getState().auth;
      const res = await fetch(`http://localhost:3000/api/pneus/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(pneuData),
      });
      if (!res.ok) throw new Error("Erreur modification pneu");
      const data = await res.json();
      return data.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/* DELETE */
export const deletePneu = createAsyncThunk(
  "pneus/deletePneu",
  async (id, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const res = await fetch(`http://localhost:3000/api/pneus/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erreur suppression pneu");
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
  selectedPneu: null, 
  loading: false,
  error: null,
};

const pneuSlice = createSlice({
  name: "pneus",
  initialState,
  reducers: {
    selectPneu: (state, action) => { state.selectedPneu = action.payload; },
    clearSelectedPneu: (state) => { state.selectedPneu = null; },
  },
  extraReducers: (builder) => {
    builder
      // FETCH
      .addCase(fetchPneus.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchPneus.fulfilled, (state, action) => { state.loading = false; state.list = action.payload; })
      .addCase(fetchPneus.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      // CREATE
      .addCase(createPneu.fulfilled, (state, action) => { state.list.push(action.payload); })
      .addCase(createPneu.rejected, (state, action) => { state.error = action.payload; })

      // UPDATE
      .addCase(updatePneu.fulfilled, (state, action) => {
        const index = state.list.findIndex(p => p._id === action.payload._id);
        if (index !== -1) state.list[index] = action.payload;
      })
      .addCase(updatePneu.rejected, (state, action) => { state.error = action.payload; })

      // DELETE
      .addCase(deletePneu.fulfilled, (state, action) => {
        state.list = state.list.filter(p => p._id !== action.payload);
        if (state.selectedPneu && state.selectedPneu._id === action.payload) state.selectedPneu = null;
      })
      .addCase(deletePneu.rejected, (state, action) => { state.error = action.payload; });
  },
});

export const { selectPneu, clearSelectedPneu } = pneuSlice.actions;
export default pneuSlice.reducer;
