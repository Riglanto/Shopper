import axios from 'axios'
import * as ReactGA from 'react-ga'

let BASE_URL = 'https://q0yi1pl6yd.execute-api.eu-central-1.amazonaws.com/dev'
if (process.env.NODE_ENV === 'development') {
    BASE_URL = 'http://localhost:4000'
}

const PRODUCTS_URL = BASE_URL + '/products'
const FAVOURITES_URL = BASE_URL + '/getFavourites'
const PUT_FAVOURITE_URL = BASE_URL + '/putFavourite'
const DELETE_FAVOURITE_URL = BASE_URL + '/deleteFavourite'
const TROLLEY_URL = BASE_URL + '/trolley'

export function searchProducts(query: string, page: number, token: string) {
    ReactGA.event({
        category: 'User',
        action: 'Searched for',
        label: query
    })
    return axios.get(PRODUCTS_URL, {
        params: { query: query, page: page },
        headers: { Authorization: token }
    })
}

export function getFavourites(token: string) {
    return axios.get(FAVOURITES_URL, {
        headers: { Authorization: token }
    })
}

export function addFavourite(product: Product, token: string) {
    ReactGA.event({
        category: 'User',
        action: 'Added fav',
        label: product.id
    })
    return axios.put(PUT_FAVOURITE_URL, { product }, {
        headers: { Authorization: token }
    })
}

export function deleteFavourite(id: string, token: string) {
    ReactGA.event({
        category: 'User',
        action: 'Removed fav',
        label: id
    })
    return axios.delete(`${DELETE_FAVOURITE_URL}/${id}`, {
        headers: { Authorization: token }
    })
}

export function buildTrolley(ids: string[], email: string, password: string, token: string) {
    ReactGA.event({
        category: 'User',
        action: 'Build trolley',
        label: ids.length.toString()
    })
    return axios.put(TROLLEY_URL, { ids, email, password }, {
        headers: { Authorization: token }
    })
}