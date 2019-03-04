import { combineReducers } from 'redux'
import shopper from './shopper'

export interface RootState {
    shopper: StoreState
}

export default combineReducers<RootState>({
    shopper
})
