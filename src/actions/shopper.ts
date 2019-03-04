import { createAction } from 'redux-actions'
import * as Actions from '../constants/actions'

export const addFav = createAction<Product>(Actions.ADD_FAV)
export const removeFav = createAction<Product>(Actions.REMOVE_FAV)
export const updateFavourite = createAction<Product>(Actions.UPDATE_FAV)
export const login = createAction<string>(Actions.LOGIN)
export const logout = createAction(Actions.LOGOUT)
export const searchProducts = createAction<string>(Actions.SEARCH_PRODUCTS)
export const receivedProducts = createAction<Product[]>(Actions.RECEIVED_PRODUCTS)
export const receivedCount = createAction<number>(Actions.RECEIVED_COUNT)
export const receivedFavourites = createAction<Product[]>(Actions.RECEIVED_FAVOURITES)