import { Handler, Context, Callback } from 'aws-lambda'
import { buildTrolley, getProducts } from './api'
import * as db from './db'
import axios from 'axios'

interface Response {
  statusCode: number
  body?: string,
  headers?: any
}

const GOOGLE_URL = 'https://www.googleapis.com/oauth2/v3/tokeninfo?id_token='
const REGEX = /@my-domain.com$/
const ADMINS: string[] = []
const SUPER_ADMINS: string[] = []
async function hasAccess(token: string, adminRequired: boolean = false) {
  const res = await axios.get(GOOGLE_URL + token)
  const email: string = res.data.email
  return (REGEX.test(email) && (!adminRequired || ADMINS.some(a => a === email)))
    || SUPER_ADMINS.some(sa => sa === email)
}

const products: Handler = async (event: ProductsEvent, context: Context, callback: Callback) => {
  const token = event.headers.Authorization
  if (!await hasAccess(token)) {
    const errResponse: Response = {
      headers: { 'Access-Control-Allow-Origin': '*' },
      statusCode: 401
    }
    callback(undefined, errResponse)
    return
  }

  const query = event.queryStringParameters.query
  const page = event.queryStringParameters.page || 1

  getProducts(query, page)
    .then(result => {
      const response: Response = {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({
          products: result.products,
          count: result.count
        })
      }
      callback(undefined, response)
    })
    .catch(err => callback(undefined, err))
}

const trolley: Handler = async (event: PutEvent, context: Context, callback: Callback) => {
  const token = event.headers.Authorization
  if (!await hasAccess(token)) {
    const errResponse: Response = {
      headers: { 'Access-Control-Allow-Origin': '*' },
      statusCode: 401
    }
    callback(undefined, errResponse)
    return
  }

  const body = JSON.parse(event.body)
  const email = body.email
  const password = body.password
  const ids: string[] = body.ids
  buildTrolley(email, password, ids)
    .then(result => {
      const response: Response = {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({
          result
        })
      }
      callback(undefined, response)
    })
    .catch(err => {
      const errResponse: Response = {
        headers: { 'Access-Control-Allow-Origin': '*' },
        statusCode: err === 'Incorrect credentials' ? 403 : 500,
        body: err
      }
      callback(undefined, errResponse)
    })
}

const putFavourite: Handler = async (event: PutEvent, context: Context, callback: Callback) => {
  const token = event.headers.Authorization
  if (!await hasAccess(token)) {
    const errResponse: Response = {
      headers: { 'Access-Control-Allow-Origin': '*' },
      statusCode: 401
    }
    callback(undefined, errResponse)
    return
  }

  const product = JSON.parse(event.body).product
  db.addFavourite(product).promise().then(data => {
    const response: Response = {
      statusCode: 201,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ data })
    }
    callback(undefined, response)
  }).catch(err => {
    const response: Response = {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ err })
    }
    callback(undefined, response)
  })
}

const deleteFavourite: Handler = async (event: DeleteEvent, context: Context, callback: Callback) => {
  const token = event.headers.Authorization
  if (!await hasAccess(token, true)) {
    const errResponse: Response = {
      headers: { 'Access-Control-Allow-Origin': '*' },
      statusCode: 401
    }
    callback(undefined, errResponse)
    return
  }

  const id = event.pathParameters.id
  db.deleteFavourite(id).promise().then(data => {
    const response: Response = {
      statusCode: 202,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ data })
    }
    callback(undefined, response)
  }).catch(err => {
    const response: Response = {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ err })
    }
    callback(undefined, response)
  })
}

const getFavourites: Handler = async (event: BaseEvent, context: Context, callback: Callback) => {
  const token = event.headers.Authorization
  if (!await hasAccess(token)) {
    const errResponse: Response = {
      headers: { 'Access-Control-Allow-Origin': '*' },
      statusCode: 401
    }
    callback(undefined, errResponse)
    return
  }

  db.getFavourites().promise().then(data => {
    const favourites = data.Items
    const response: Response = {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ favourites })
    }
    callback(undefined, response)
  }).catch(err => {
    const response: Response = {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ err })
    }
    callback(undefined, response)
  })
}

export { products, trolley, putFavourite, getFavourites, deleteFavourite }