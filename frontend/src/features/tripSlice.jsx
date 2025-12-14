import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

/* =========================
   🔹 THUNKS CRUD
========================= */

/* FETCH ALL */
export const fetchTrips = createAsyncThunk(
  "trips/fetchTrips",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const res = await fetch("http://localhost:3000/api/trips", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Erreur du chargement des trajets");
      const data = await res.json();
      return data.data || [];
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchMyTrips = createAsyncThunk(
  "trips/fetchMyTrips",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const res = await fetch("http://localhost:3000/api/trips/driver/my-trips", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Erreur du chargement de mes trajets");
      const data = await res.json();
      return data.data || [];
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/* FETCH BY ID */
export const fetchTripById = createAsyncThunk(
  "trips/fetchTripById",
  async (id, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const res = await fetch(`http://localhost:3000/api/trips/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Erreur du chargement du trajet");
      const data = await res.json();
      return data.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/* CREATE */
export const createTrip = createAsyncThunk(
  "trips/createTrip",
  async (tripData, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const res = await fetch("http://localhost:3000/api/trips", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(tripData),
      });
      if (!res.ok) throw new Error("Erreur création du trajet");
      const data = await res.json();
      return data.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/* UPDATE */
export const updateTrip = createAsyncThunk(
  "trips/updateTrip",
  async ({ id, tripData }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const res = await fetch(`http://localhost:3000/api/trips/${id}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(tripData),
      });
      if (!res.ok) throw new Error("Erreur modification du trajet");
      const data = await res.json();
      return data.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/* DELETE */
export const deleteTrip = createAsyncThunk(
  "trips/deleteTrip",
  async (id, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const res = await fetch(`http://localhost:3000/api/trips/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Erreur suppression du trajet");
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/* START TRIP */
export const startTrip = createAsyncThunk(
  "trips/startTrip",
  async ({ id, startData }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const res = await fetch(`http://localhost:3000/api/trips/${id}/start`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(startData),
      });
      if (!res.ok) throw new Error("Erreur démarrage du trajet");
      const data = await res.json();
      return data.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/* END TRIP */
export const endTrip = createAsyncThunk(
  "trips/endTrip",
  async ({ id, endData }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const res = await fetch(`http://localhost:3000/api/trips/${id}/end`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(endData),
      });
      if (!res.ok) throw new Error("Erreur fin du trajet");
      const data = await res.json();
      return data.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/* =========================
   🔹 INITIAL STATE
========================= */
const initialState = {
  list: [],
  selectedTrip: null,
  loading: false,
  error: null,
  tripStatus: ["a-faire", "en-cours", "termine"],
  tripTypes: ["livraison", "transport", "autres"],
};

/* =========================
   🔹 SLICE
========================= */
const tripSlice = createSlice({
  name: "trips",
  initialState,
  reducers: {
    selectTrip: (state, action) => { 
      state.selectedTrip = action.payload; 
    },
    clearSelectedTrip: (state) => { 
      state.selectedTrip = null; 
    },
  },
  extraReducers: (builder) => {
    builder
      /* FETCH ALL */
      .addCase(fetchTrips.pending, (state) => { 
        state.loading = true; 
        state.error = null; 
      })
      .addCase(fetchTrips.fulfilled, (state, action) => { 
        state.loading = false; 
        state.list = action.payload; 
      })
      .addCase(fetchTrips.rejected, (state, action) => { 
        state.loading = false; 
        state.error = action.payload; 
      })

      .addCase(fetchMyTrips.pending, (state) => { 
        state.loading = true; 
        state.error = null; 
      })
      .addCase(fetchMyTrips.fulfilled, (state, action) => { 
        state.loading = false; 
        state.list = action.payload; 
      })
      .addCase(fetchMyTrips.rejected, (state, action) => { 
        state.loading = false; 
        state.error = action.payload; 
      })

      /* FETCH BY ID */
      .addCase(fetchTripById.fulfilled, (state, action) => { 
        state.selectedTrip = action.payload; 
      })

      /* CREATE */
      .addCase(createTrip.fulfilled, (state, action) => { 
        state.list.push(action.payload); 
      })
      .addCase(createTrip.rejected, (state, action) => { 
        state.error = action.payload; 
      })

      /* UPDATE */
      .addCase(updateTrip.fulfilled, (state, action) => {
        const index = state.list.findIndex(t => t._id === action.payload._id);
        if (index !== -1) state.list[index] = action.payload;
      })
      .addCase(updateTrip.rejected, (state, action) => { 
        state.error = action.payload; 
      })

      /* DELETE */
      .addCase(deleteTrip.fulfilled, (state, action) => {
        state.list = state.list.filter(t => t._id !== action.payload);
        if (state.selectedTrip && state.selectedTrip._id === action.payload) {
          state.selectedTrip = null;
        }
      })
      .addCase(deleteTrip.rejected, (state, action) => { 
        state.error = action.payload; 
      })

      /* START TRIP */
      .addCase(startTrip.fulfilled, (state, action) => {
        const index = state.list.findIndex(t => t._id === action.payload._id);
        if (index !== -1) state.list[index] = action.payload;
        if (state.selectedTrip && state.selectedTrip._id === action.payload._id) {
          state.selectedTrip = action.payload;
        }
      })

      /* END TRIP */
      .addCase(endTrip.fulfilled, (state, action) => {
        const index = state.list.findIndex(t => t._id === action.payload._id);
        if (index !== -1) state.list[index] = action.payload;
        if (state.selectedTrip && state.selectedTrip._id === action.payload._id) {
          state.selectedTrip = action.payload;
        }
      });
  },
});

export const { selectTrip, clearSelectedTrip } = tripSlice.actions;
export default tripSlice.reducer;