import { handleActions } from 'redux-actions'
import * as Actions from '../constants/actions'
import history from '../History'

const initialState: StoreState = {
    products: [] as Product[],
    favourites: [] as Product[],
    isLoggedIn: false,
    token: '',
    count: 0
}
export default handleActions<StoreState, string | number | Product | Product[]>({
    [Actions.LOGIN]: (state, action) => {
        const token = action.payload as string
        sessionStorage.setItem('token', token)
        return {
            ...state, isLoggedIn: true, token
        }
    },
    [Actions.LOGOUT]: (state, action) => {
        sessionStorage.removeItem('token')
        history.push('/login')
        return {
            ...state, isLoggedIn: false, token: ''
        }
    },
    [Actions.RECEIVED_PRODUCTS]: (state, action) => {
        const products = action.payload as Product[]
        const favourites: string[] = state.favourites.map(f => f.id)
        products.forEach(p => p.favourited = favourites.indexOf(p.id) !== -1)
        return {
            ...state, products
        }
    },
    [Actions.RECEIVED_FAVOURITES]: (state, action) => {
        const favourites = action.payload as Product[]
        const ids: string[] = favourites.map(f => f.id)
        const products = state.products
        products.forEach(p => p.favourited = ids.indexOf(p.id) !== -1)
        return {
            ...state, products, favourites
        }
    },
    [Actions.RECEIVED_COUNT]: (state, action) => {
        return { ...state, count: action.payload as number }
    },

    [Actions.UPDATE_FAV]: (state, action) => {
        const fav = action.payload as Product
        const favourites = state.favourites
        const index = favourites.findIndex(p => p.id === fav.id)
        favourites[index] = { ...fav }
        return { ...state, favourites }
    }
    // tslint:disable-next-line:align
}, initialState)
