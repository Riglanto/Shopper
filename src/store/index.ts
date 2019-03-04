import { createStore, applyMiddleware, Store } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import { logger } from '../middleware'
import rootReducer, { RootState } from '../reducers'

export function configureStore(initialState?: RootState) {
    let middleware

    if (process.env.NODE_ENV === 'development') {
        middleware = applyMiddleware(logger)
        middleware = composeWithDevTools(middleware)
    }

    const store = createStore(rootReducer, initialState, middleware) as Store<RootState>

    // if (module.hot) {
    //     module.hot.accept('../reducers', () => {
    //         const nextReducer = require('../reducers');
    //         store.replaceReducer(nextReducer);
    //     });
    // }

    return store
}
