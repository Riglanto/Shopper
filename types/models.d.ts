declare type StoreState = {
    products: Product[]
    favourites: Product[]
    isLoggedIn: boolean
    token: string
    count: number
}

declare type Product = {
    id: string
    name: string
    photo: string
    price: string
    favourited?: boolean
    checked?: boolean
    tags: string[]
}