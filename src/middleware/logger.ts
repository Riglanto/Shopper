// tslint:disable-next-line:no-any
export default function loggerMiddleware(store: any) {
    // tslint:disable-next-line:no-any
    return (next: any) => (action: any) => {
        console.log(action)
        return next(action)
    }
}
