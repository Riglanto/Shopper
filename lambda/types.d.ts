interface BaseEvent extends Event {
    headers: {
        Authorization: string
    }
}

interface ProductsEvent extends BaseEvent {
    queryStringParameters: {
        query: string,
        page: number
    }
}

interface DeleteEvent extends BaseEvent {
    pathParameters: {
        id: string
    }
}

interface PutEvent extends BaseEvent {
    body: string
}

interface TrolleyEvent extends BaseEvent {
    body: {
        ids: string[],
        email: string,
        password: string
    }
}

declare type Product = {
    id: string
    name: string
    photo: string
    price: string
}