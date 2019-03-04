import axios, { AxiosResponse } from 'axios'
const xpath = require('xpath')
const dom = require('xmldom').DOMParser
const LOGIN_URL = 'https://ezakupy.tesco.pl/groceries/pl-PL/login'
const qs = require('qs')

const BASE = 'https://ezakupy.tesco.pl/groceries/pl-PL/resources' +
    '?names=appState,trolleyContents,taxonomy,search&params=JTdCJTIycXVlcnklMjIlM0ElN0IlMjJxdWVyeSUyMiUzQSUyM'

export async function getData(query: string) {
    try {
        const res = await axios.get(BASE + query)
        return res.data
    } catch (err) {
        return err
    }
}

const SEARCH_URL = 'https://ezakupy.tesco.pl/groceries/pl-PL/search?query='
export async function getProducts(query: string, page: number = 1) {
    const pageNumber = '&page=' + page
    const response = await axios.get(SEARCH_URL + query + pageNumber)
    const parseProduct = (p: any) => {
        return {
            id: p.id,
            name: p.title,
            photo: p.defaultImageUrl,
            price: p.price
        }
    }
    const products = response.data.search.data.results.productItems.map((p: any) => parseProduct(p.product))
    const count = response.data.search.data.results.pageInformation.totalCount
    return { products, count }
}

const EMPTY_TROLLEY_URL = 'https://ezakupy.tesco.pl/groceries/pl-PL/trolley/items'
const ADD_PRODUCT_URL = 'https://ezakupy.tesco.pl/groceries/pl-PL/trolley/items?_method=PUT'
const HOME_URL = 'https://ezakupy.tesco.pl/groceries/pl-PL/'

function getProductPutParams(id: string, amount: number) {
    return {
        id: id,
        newValue: amount,
        oldValue: 0,
        newUnitChoice: 'pcs',
        oldUnitChoice: 'pcs'
    }
}

function getPutHeaders(response: AxiosResponse) {
    return {
        headers: {
            'accept': 'application/json',
            'x-csrf-token': response.data.appState.data.csrfToken,
            'content-type': 'application/json',
            Cookie: response.headers['set-cookie'],
        }
    }
}

export async function buildTrolley(email: string, password: string, productIds: string[]): Promise<string[]> {
    try {
        let response = await axios.get(LOGIN_URL)
        const doc = new dom().parseFromString(response.data)
        const csrf = xpath.select('//input[@name=\'_csrf\']/@value', doc)[0].value
        const data = qs.stringify({ 'email': email, 'password': password, '_csrf': csrf })
        const cookie = response.headers['set-cookie']
        const config = {
            maxRedirects: 0,
            headers: {
                referer: 'https://ezakupy.tesco.pl/groceries/pl-PL/login',
                'content-type': 'application/x-www-form-urlencoded',
                Cookie: cookie
            }
        }
        response = await axios.post(LOGIN_URL, data, config)
        return Promise.reject('Incorrect credentials')
    } catch (err) {
        if (err.response.status !== 302) {
            return Promise.reject('Login failed: ' + err.response.status)
        }
        let response = await axios.get(HOME_URL, { headers: { Cookie: err.response.headers['set-cookie'] } })
        const headers = getPutHeaders(response)
        // response = await axios.delete(EMPTY_TROLLEY_URL, headers)
        // if (response.status !== 204) {
        //     return Promise.reject('Could not empty trolley: ' + response.status)
        // }
        const added: string[] = []
        const size = 30
        for (let i = 0; i < productIds.length; i += size) {
            const chunk = productIds.slice(i, i + 30)
            const items = chunk.map(id => getProductPutParams(id, 1))
            const json = JSON.stringify({ items: items })
            response = await axios.put(ADD_PRODUCT_URL, json, headers)
            const result = response.data.updates.items
            result.forEach((item: any) => item.status === 'Success' && added.push(item.id))
        }
        return added
    }
}