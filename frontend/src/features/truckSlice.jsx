import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

/* =========================
   🔹 THUNKS CRUD
========================= */

/* FETCH */
export const fetchTrucks = createAsyncThunk(
  "trucks/fetchTrucks",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      if (!token) return rejectWithValue("Utilisateur non authentifié");

      const res = await fetch("http://localhost:3000/api/trucks", {
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Erreur lors du chargement des camions");
      }

      const data = await res.json();
      return Array.isArray(data.data) ? data.data : [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/* CREATE */
export const createTruck = createAsyncThunk(
  "trucks/createTruck",
  async (truckData, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const res = await fetch("http://localhost:3000/api/trucks", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(truckData),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Erreur création truck");
      }
      return await res.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/* UPDATE */
export const updateTruck = createAsyncThunk(
  "trucks/updateTruck",
  async ({ id, truckData }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const res = await fetch(`http://localhost:3000/api/trucks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(truckData),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Erreur modification truck");
      }
      return await res.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/* DELETE */
export const deleteTruck = createAsyncThunk(
  "trucks/deleteTruck",
  async (id, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const res = await fetch(`http://localhost:3000/api/trucks/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Erreur suppression truck");
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
  selectedTruck: null,
  loading: false,
  error: null,
  truckStatus: ["disponible", "en_mission", "en_maintenance", "hors_service"],
};

/* =========================
   🔹 SLICE
========================= */
const truckSlice = createSlice({
  name: "trucks",
  initialState,
  reducers: {
    selectTruck: (state, action) => { state.selectedTruck = action.payload; },
    clearSelectedTruck: (state) => { state.selectedTruck = null; },
  },
  extraReducers: (builder) => {
    builder
      /* FETCH */
      .addCase(fetchTrucks.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchTrucks.fulfilled, (state, action) => { state.loading = false; state.list = action.payload; })
      .addCase(fetchTrucks.rejected, (state, action) => { state.loading = false; state.error = action.payload; state.list = []; })

      /* CREATE */
      .addCase(createTruck.fulfilled, (state, action) => { state.list.push(action.payload); })
      .addCase(createTruck.rejected, (state, action) => { state.error = action.payload; })

      /* UPDATE */
      .addCase(updateTruck.fulfilled, (state, action) => {
        const index = state.list.findIndex(t => t._id === action.payload._id);
        if (index !== -1) state.list[index] = action.payload;
      })
      .addCase(updateTruck.rejected, (state, action) => { state.error = action.payload; })

      /* DELETE */
      .addCase(deleteTruck.fulfilled, (state, action) => {
        state.list = state.list.filter(t => t._id !== action.payload);
        if (state.selectedTruck && state.selectedTruck._id === action.payload) state.selectedTruck = null;
      })
      .addCase(deleteTruck.rejected, (state, action) => { state.error = action.payload; });
  },
});

export const { selectTruck, clearSelectedTruck } = truckSlice.actions;
export default truckSlice.reducer;
