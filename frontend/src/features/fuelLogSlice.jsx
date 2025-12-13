import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchFuelLogs = createAsyncThunk(
  "fuelLog/fetchFuelLogs",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const res = await fetch("http://localhost:3000/api/fuelLog", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Erreur du chargement de fuelLogs");
      const data = await res.json();
      return data.data || [];
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchFuelLogsByTrip = createAsyncThunk(
  "fuelLog/fetchFuelLogsByTrip",
  async (tripId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const res = await fetch(`http://localhost:3000/api/fuelLog/trip/${tripId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Erreur du chargement des fuelLogs par trip");
      const data = await res.json();
      return data.data || [];
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const createFuelLog = createAsyncThunk(
  "fuelLog/createFuelLog",
  async (fuelLogData, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      
      // Créer un FormData pour envoyer le fichier
      const formData = new FormData();
      formData.append("trip", fuelLogData.trip);
      formData.append("montant", fuelLogData.montant);
      
      if (fuelLogData.facture) {
        formData.append("facture", fuelLogData.facture);
      }

      const res = await fetch("http://localhost:3000/api/fuelLog/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (!res.ok) throw new Error("Erreur création de fuelLog");
      const data = await res.json();
      return data.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteFuelLog = createAsyncThunk(
  "fuelLog/deleteFuelLog",
  async (id, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const res = await fetch(`http://localhost:3000/api/fuelLog/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Erreur suppression de fuelLog");
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  list: [],
  selectedFuelLog: null,
  loading: false,
  error: null,
};

const fuelLogSlice = createSlice({
  name: "fuelLog",
  initialState,
  reducers: {
    selectFuelLog: (state, action) => { 
      state.selectedFuelLog = action.payload; 
    },
    clearSelectedFuelLog: (state) => { 
      state.selectedFuelLog = null; 
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFuelLogs.pending, (state) => { 
        state.loading = true; 
        state.error = null; 
      })
      .addCase(fetchFuelLogs.fulfilled, (state, action) => { 
        state.loading = false; 
        state.list = action.payload; 
      })
      .addCase(fetchFuelLogs.rejected, (state, action) => { 
        state.loading = false; 
        state.error = action.payload; 
      })

      .addCase(fetchFuelLogsByTrip.pending, (state) => { 
        state.loading = true; 
        state.error = null; 
      })
      .addCase(fetchFuelLogsByTrip.fulfilled, (state, action) => { 
        state.loading = false; 
        state.list = action.payload; 
      })
      .addCase(fetchFuelLogsByTrip.rejected, (state, action) => { 
        state.loading = false; 
        state.error = action.payload; 
      })

      .addCase(createFuelLog.fulfilled, (state, action) => { 
        state.list.push(action.payload); 
      })
      .addCase(createFuelLog.rejected, (state, action) => { 
        state.error = action.payload; 
      })

      .addCase(deleteFuelLog.fulfilled, (state, action) => {
        state.list = state.list.filter(f => f._id !== action.payload);
        if (state.selectedFuelLog && state.selectedFuelLog._id === action.payload) {
          state.selectedFuelLog = null;
        }
      })
      .addCase(deleteFuelLog.rejected, (state, action) => { 
        state.error = action.payload; 
      });
  },
});

export const { selectFuelLog, clearSelectedFuelLog } = fuelLogSlice.actions;
export default fuelLogSlice.reducer;