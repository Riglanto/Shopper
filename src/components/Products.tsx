import * as React from 'react'
import { TextField, RaisedButton } from 'material-ui'
import { Card, CardMedia, CardTitle, CardActions } from 'material-ui'
import Check from 'material-ui/svg-icons/action/check-circle'

interface Props {
    products: Product[]
    count: number
    search: (query: string) => void
    addFavourite: (product: Product) => void
    loadMore: (query: string, page: number) => void
}

interface State {
    query: string,
    page: number
}

const cardStyle = {
    width: 150,
    height: 360
}
const titleStyle = {
    title: {
        fontSize: 14,
        lineHeight: '14px',
        height: 112
    }
}

const PRODUCT_URL = 'https://ezakupy.tesco.pl/groceries/pl-PL/products/'

export class ProductsComponent extends React.Component<Props, State> {
    state = {
        query: '',
        page: 0
    }

    search() {
        const query = this.state.query.trim()
        if (query.length === 0) {
            return
        }
        this.setState(() => ({ page: 1 }))
        this.props.search(query)
    }

    loadMore() {
        const page = this.state.page + 1
        this.props.loadMore(this.state.query, page)
        this.setState(() => ({ page }))
    }

    render() {
        const { products, addFavourite, count } = this.props
        const more = count - products.length > 0
        return (
            <div>
                <div className='products-actions'>
                    <TextField
                        hintText='Search for food...'
                        value={this.state.query}
                        onChange={(e, value) => this.setState(() => ({ query: value }))}
                        onKeyDown={e => e.keyCode === 13 && this.search()}
                    />
                    <RaisedButton
                        primary
                        label='Search'
                        disabled={this.state.query.trim().length === 0}
                        onClick={() => this.search()}
                    />
                </div>
                {products.length === 0 && (this.state.page === 0
                    ? <div className='not-found'>
                        <img src='assets/welcome.jpg' />
                        <p>Welcome!</p>
                    </div>
                    : <div className='not-found'>
                        <img src='assets/notfound.jpg' />
                        <p>No products found.</p>
                    </div>)
                }
                <div className='cards'>
                    {products.map(product => (<Card key={product.id} style={cardStyle}>
                        <CardMedia>
                            <img onClick={() => window.open(PRODUCT_URL + product.id, '_blank')} src={product.photo} />
                        </CardMedia>
                        <CardTitle
                            titleStyle={titleStyle.title}
                            title={product.name}
                            subtitle={`${product.price} zł`}
                        />
                        <CardActions>
                            <RaisedButton
                                primary
                                fullWidth
                                disabled={product.favourited}
                                label={!product.favourited && 'ADD'}
                                icon={product.favourited && <Check color='green' />}
                                onClick={() => addFavourite(product)}
                            />
                        </CardActions>
                    </Card>))}
                    {more && <Card style={cardStyle}>
                        <CardActions>
                            <RaisedButton
                                primary
                                fullWidth
                                style={{ height: 340 }}
                                label='Load more'
                                onClick={() => this.loadMore()}
                            />
                        </CardActions>
                    </Card>}
                </div>{/* {more && <RaisedButton
                    secondary
                    fullWidth
                    label='Load more'
                    onClick={() => this.loadMore()}
                />} */}
            </div>
        )
    }
}