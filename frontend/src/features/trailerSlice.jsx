import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

/* =========================
   🔹 THUNKS CRUD
========================= */

/* FETCH */
export const fetchTrailers = createAsyncThunk(
  "trailers/fetchTrailers",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const res = await fetch("http://localhost:3000/api/trailers", {
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Erreur chargement trailers");
      }
      const data = await res.json();
      return Array.isArray(data.data) ? data.data : [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/* CREATE */
export const createTrailer = createAsyncThunk(
  "trailers/createTrailer",
  async (trailerData, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const res = await fetch("http://localhost:3000/api/trailers", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(trailerData),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Erreur création trailer");
      }
      return await res.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/* UPDATE */
export const updateTrailer = createAsyncThunk(
  "trailers/updateTrailer",
  async ({ id, trailerData }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const res = await fetch(`http://localhost:3000/api/trailers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(trailerData),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Erreur modification trailer");
      }
      return await res.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/* DELETE */
export const deleteTrailer = createAsyncThunk(
  "trailers/deleteTrailer",
  async (id, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const res = await fetch(`http://localhost:3000/api/trailers/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Erreur suppression trailer");
      }
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/* =========================
   🔹 INITIAL STATE
========================= */
const initialState = {
  list: [],
  selectedTrailer: null,
  loading: false,
  error: null,
  trailerStatus: ["available", "on_trip", "maintenance", "unavailable"],
};

/* =========================
   🔹 SLICE
========================= */
const trailerSlice = createSlice({
  name: "trailers",
  initialState,
  reducers: {
    selectTrailer: (state, action) => { state.selectedTrailer = action.payload; },
    clearSelectedTrailer: (state) => { state.selectedTrailer = null; },
  },
  extraReducers: (builder) => {
    builder
      /* FETCH */
      .addCase(fetchTrailers.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchTrailers.fulfilled, (state, action) => { state.loading = false; state.list = action.payload; })
      .addCase(fetchTrailers.rejected, (state, action) => { state.loading = false; state.error = action.payload; state.list = []; })

      /* CREATE */
      .addCase(createTrailer.fulfilled, (state, action) => { state.list.push(action.payload); })
      .addCase(createTrailer.rejected, (state, action) => { state.error = action.payload; })

      /* UPDATE */
      .addCase(updateTrailer.fulfilled, (state, action) => {
        const index = state.list.findIndex(t => t._id === action.payload._id);
        if (index !== -1) state.list[index] = action.payload;
      })
      .addCase(updateTrailer.rejected, (state, action) => { state.error = action.payload; })

      /* DELETE */
      .addCase(deleteTrailer.fulfilled, (state, action) => {
        state.list = state.list.filter(t => t._id !== action.payload);
        if (state.selectedTrailer && state.selectedTrailer._id === action.payload) state.selectedTrailer = null;
      })
      .addCase(deleteTrailer.rejected, (state, action) => { state.error = action.payload; });
  },
});

export const { selectTrailer, clearSelectedTrailer } = trailerSlice.actions;
export default trailerSlice.reducer;
