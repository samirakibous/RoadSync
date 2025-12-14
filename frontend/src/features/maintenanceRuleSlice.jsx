import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

/* =========================
   🔹 THUNKS CRUD
========================= */

/* FETCH ALL */
export const fetchMaintenanceRules = createAsyncThunk(
  "maintenanceRules/fetchAll",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const res = await fetch("http://localhost:3000/api/maintenance-rules", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Erreur du chargement des règles de maintenance");
      const data = await res.json();
      return data.data || [];
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/* FETCH BY ID */
export const fetchMaintenanceRuleById = createAsyncThunk(
  "maintenanceRules/fetchById",
  async (id, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const res = await fetch(`http://localhost:3000/api/maintenance-rules/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Erreur du chargement de la règle");
      const data = await res.json();
      return data.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/* CREATE */
export const createMaintenanceRule = createAsyncThunk(
  "maintenanceRules/create",
  async (ruleData, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const res = await fetch("http://localhost:3000/api/maintenance-rules", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(ruleData),
      });
      if (!res.ok) throw new Error("Erreur création de la règle");
      const data = await res.json();
      return data.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/* UPDATE */
export const updateMaintenanceRule = createAsyncThunk(
  "maintenanceRules/update",
  async ({ id, ruleData }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const res = await fetch(`http://localhost:3000/api/maintenance-rules/${id}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(ruleData),
      });
      if (!res.ok) throw new Error("Erreur modification de la règle");
      const data = await res.json();
      return data.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/* DELETE */
export const deleteMaintenanceRule = createAsyncThunk(
  "maintenanceRules/delete",
  async (id, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const res = await fetch(`http://localhost:3000/api/maintenance-rules/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Erreur suppression de la règle");
      return id;
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
  selectedRule: null,
  loading: false,
  error: null,
  types: ["truck", "trailer", "pneu"],
  actions: ["vidange", "revision", "changement_pneu", "controle_securite", "autre"],
};

/* =========================
   🔹 SLICE
========================= */
const maintenanceRuleSlice = createSlice({
  name: "maintenanceRules",
  initialState,
  reducers: {
    selectRule: (state, action) => { 
      state.selectedRule = action.payload; 
    },
    clearSelectedRule: (state) => { 
      state.selectedRule = null; 
    },
  },
  extraReducers: (builder) => {
    builder
      /* FETCH ALL */
      .addCase(fetchMaintenanceRules.pending, (state) => { 
        state.loading = true; 
        state.error = null; 
      })
      .addCase(fetchMaintenanceRules.fulfilled, (state, action) => { 
        state.loading = false; 
        state.list = action.payload; 
      })
      .addCase(fetchMaintenanceRules.rejected, (state, action) => { 
        state.loading = false; 
        state.error = action.payload; 
      })

      /* FETCH BY ID */
      .addCase(fetchMaintenanceRuleById.fulfilled, (state, action) => { 
        state.selectedRule = action.payload; 
      })

      /* CREATE */
      .addCase(createMaintenanceRule.fulfilled, (state, action) => { 
        state.list.push(action.payload); 
      })
      .addCase(createMaintenanceRule.rejected, (state, action) => { 
        state.error = action.payload; 
      })

      /* UPDATE */
      .addCase(updateMaintenanceRule.fulfilled, (state, action) => {
        const index = state.list.findIndex(r => r._id === action.payload._id);
        if (index !== -1) state.list[index] = action.payload;
      })
      .addCase(updateMaintenanceRule.rejected, (state, action) => { 
        state.error = action.payload; 
      })

      /* DELETE */
      .addCase(deleteMaintenanceRule.fulfilled, (state, action) => {
        state.list = state.list.filter(r => r._id !== action.payload);
        if (state.selectedRule && state.selectedRule._id === action.payload) {
          state.selectedRule = null;
        }
      })
      .addCase(deleteMaintenanceRule.rejected, (state, action) => { 
        state.error = action.payload; 
      });
  },
});

export const { selectRule, clearSelectedRule } = maintenanceRuleSlice.actions;
export default maintenanceRuleSlice.reducer;