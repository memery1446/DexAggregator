import { configureStore } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

const placeholderSlice = createSlice({
  name: 'placeholder',
  initialState: {
    isLoading: false,
    // You can add more state properties here later
  },
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload
    },
    // You can add more reducers here later
  }
})

export const { setLoading } = placeholderSlice.actions

export const store = configureStore({
  reducer: {
    placeholder: placeholderSlice.reducer,
    // You can add more reducers here later
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
