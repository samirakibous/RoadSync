import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchMaintenances = createAsyncThunk(
  "maintenances/fetchAll",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const res = await fetch("http://localhost:3000/api/maintenance", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Erreur du chargement des maintenances");
      const data = await res.json();
      return data.data || [];
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchMaintenanceById = createAsyncThunk(
  "maintenances/fetchById",
  async (id, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const res = await fetch(`http://localhost:3000/api/maintenance/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Erreur du chargement de la maintenance");
      const data = await res.json();
      return data.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const createMaintenance = createAsyncThunk(
  "maintenances/create",
  async (maintenanceData, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const res = await fetch("http://localhost:3000/api/maintenance", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(maintenanceData),
      });
      if (!res.ok) throw new Error("Erreur création de la maintenance");
      const data = await res.json();
      return data.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateMaintenance = createAsyncThunk(
  "maintenances/update",
  async ({ id, maintenanceData }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const res = await fetch(`http://localhost:3000/api/maintenance/${id}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(maintenanceData),
      });
      if (!res.ok) throw new Error("Erreur modification de la maintenance");
      const data = await res.json();
      return data.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteMaintenance = createAsyncThunk(
  "maintenances/delete",
  async (id, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const res = await fetch(`http://localhost:3000/api/maintenance/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Erreur suppression de la maintenance");
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const completeMaintenance = createAsyncThunk(
  "maintenances/complete",
  async ({ id, completionData }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const res = await fetch(`http://localhost:3000/api/maintenance/${id}/complete`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(completionData),
      });
      if (!res.ok) throw new Error("Erreur lors de la complétion de la maintenance");
      const data = await res.json();
      return data.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  list: [],
  selectedMaintenance: null,
  loading: false,
  error: null,
  types: ["preventive", "corrective", "predictive"],
  statuses: ["planifiee", "en-cours", "terminee", "annulee"],
};

const maintenanceSlice = createSlice({
  name: "maintenances",
  initialState,
  reducers: {
    selectMaintenance: (state, action) => { 
      state.selectedMaintenance = action.payload; 
    },
    clearSelectedMaintenance: (state) => { 
      state.selectedMaintenance = null; 
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(fetchMaintenances.pending, (state) => { 
        state.loading = true; 
        state.error = null; 
      })
      .addCase(fetchMaintenances.fulfilled, (state, action) => { 
        state.loading = false; 
        state.list = action.payload; 
      })
      .addCase(fetchMaintenances.rejected, (state, action) => { 
        state.loading = false; 
        state.error = action.payload; 
      })

      .addCase(fetchMaintenanceById.fulfilled, (state, action) => { 
        state.selectedMaintenance = action.payload; 
      })

      .addCase(createMaintenance.fulfilled, (state, action) => { 
        state.list.push(action.payload); 
      })
      .addCase(createMaintenance.rejected, (state, action) => { 
        state.error = action.payload; 
      })

      .addCase(updateMaintenance.fulfilled, (state, action) => {
        const index = state.list.findIndex(m => m._id === action.payload._id);
        if (index !== -1) state.list[index] = action.payload;
      })
      .addCase(updateMaintenance.rejected, (state, action) => { 
        state.error = action.payload; 
      })

      .addCase(deleteMaintenance.fulfilled, (state, action) => {
        state.list = state.list.filter(m => m._id !== action.payload);
        if (state.selectedMaintenance && state.selectedMaintenance._id === action.payload) {
          state.selectedMaintenance = null;
        }
      })
      .addCase(deleteMaintenance.rejected, (state, action) => { 
        state.error = action.payload; 
      })

      .addCase(completeMaintenance.fulfilled, (state, action) => {
        const index = state.list.findIndex(m => m._id === action.payload._id);
        if (index !== -1) state.list[index] = action.payload;
        if (state.selectedMaintenance && state.selectedMaintenance._id === action.payload._id) {
          state.selectedMaintenance = action.payload;
        }
      });
  },
});

export const { selectMaintenance, clearSelectedMaintenance } = maintenanceSlice.actions;
export default maintenanceSlice.reducer;
