import * as React from 'react'
import { ProductsComponent } from '../components/Products'
import { FavouritesComponent } from '../components/Favourites'
import history from '../History'
import { RootState } from '../reducers'
import { connect } from 'react-redux'
import * as actions from '../actions/shopper'
import * as api from '../api'
import {
    AppBar, IconButton, IconMenu, MenuItem, Dialog, Snackbar, LinearProgress,
    Paper, BottomNavigation, BottomNavigationItem, CircularProgress, TextField, RaisedButton
} from 'material-ui'
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert'
import ActionAddShoppingCart from 'material-ui/svg-icons/action/add-shopping-cart'
import ActionFavorite from 'material-ui/svg-icons/action/favorite'
import Delete from 'material-ui/svg-icons/action/delete'
import Info from 'material-ui/svg-icons/action/info-outline'

import './Main.css'

const TESCO_URL = 'https://ezakupy.tesco.pl/groceries/pl-PL/login'
const PRODUCT_URL = 'https://ezakupy.tesco.pl/groceries/pl-PL/products/'

interface Props {
    products: Product[]
    favourites: Product[]
    isLoggedIn: boolean
    token: string
    count: number
    receivedProducts: (products: Product[]) => void
    receivedCount: (count: number) => void
    receivedFavourites: (products: Product[]) => void
    updateFavourite: (product: Product) => void
    logout: () => void
}

interface State {
    selectedIndex: number
    loading: boolean
    openModal: boolean
    openSnack: boolean
    openSummary: boolean
    snackMsg: string
    email: string
    password: string
    snackAction: string
    result: string[]
    onSnackAction: () => void
    isAdmin: boolean
    progress: number
}

@connect(mapStateToProps, mapDispatchToProps)
export class MainContainer extends React.Component<Props, State> {
    state = {
        selectedIndex: 0,
        loading: false,
        openModal: false,
        openSnack: false,
        openSummary: false,
        snackMsg: '',
        email: '',
        password: '',
        snackAction: '',
        result: [],
        onSnackAction: () => null,
        isAdmin: false,
        progress: 0
    }

    componentWillMount() {
        if (!this.props.isLoggedIn) {
            history.push('/login')
        } else {
            this.getFavourites()
        }
    }

    componentDidMount() {
        const name = sessionStorage.getItem('name')
        if (name) {
            this.openSnack(`Hello ${name}`)
        }
    }

    render() {
        return (
            <div>
                {(this.state.loading || this.state.progress > 0) && <this.Loader />}
                <AppBar
                    title='Shopper'
                    showMenuIconButton={false}
                    iconElementRight={<IconMenu
                        iconButtonElement={
                            <IconButton><MoreVertIcon /></IconButton>
                        }
                        targetOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
                    >
                        <MenuItem primaryText='Sign out' onClick={() => this.props.logout()} />
                    </IconMenu>}
                />
                <div className='content'>
                    {this.state.selectedIndex === 0
                        ?
                        <ProductsComponent
                            search={query => this.searchProducts(query)}
                            products={this.props.products}
                            count={this.props.count}
                            addFavourite={p => this.addFavourite(p)}
                            loadMore={(query, page) => this.loadMore(query, page)}
                        />
                        :
                        <FavouritesComponent
                            favourites={this.props.favourites}
                            deleteFavourite={id => this.deleteFavourite(id)}
                            updateFavourite={product => this.updateFavourite(product)}
                            toggleFavourite={product => this.props.updateFavourite(product) && this.forceUpdate()}
                            buildTrolley={() => this.openDialog()}
                        />
                    }
                </div>
                <this.Navigation />
                <this.Trolley />
                <this.Summary />
                <this.Snack />
            </div>
        )
    }

    Trolley = () => (
        <Dialog
            title='Add products to Tesco cart'
            actions={[
                <RaisedButton
                    secondary
                    key='Cancel'
                    label='Cancel'
                    onClick={() => this.openDialog(false)}
                />,
                <RaisedButton
                    primary
                    key='Submit'
                    label='Submit'
                    disabled={this.state.password === '' || this.state.email === ''}
                    onClick={() => this.buildTrolley()}
                />
            ]}
            modal={false}
            open={this.state.openModal}
            onRequestClose={() => this.openDialog()}
            actionsContainerClassName='trolley-dialog-actions'
        >
            <div className='trolley-dialog' >
                <p> There will be added {this.getSelectedIds().length} items into your Tesco cart!</p>
                <TextField
                    hintText='Tesco email'
                    type='email'
                    value={this.state.email}
                    onChange={(e, value) => this.setState(() => ({ email: value }))}
                />
                <TextField
                    hintText='Tesco password'
                    type='password'
                    value={this.state.password}
                    onChange={(e, value) => this.setState(() => ({ password: value }))}
                />
                <p>Ensure that your trolley is empty!</p>
            </div>
        </Dialog>
    )

    Summary = () => {
        const all = this.getSelectedIds().length
        const added = this.state.result.length
        const diff = all - added
        return (
            <Dialog
                title='Summary'
                actions={[
                    <RaisedButton
                        secondary
                        key='Close'
                        label='Close'
                        onClick={() => this.openSummary(false)}
                    />,
                    <RaisedButton
                        primary
                        key='Go'
                        label='Go to Tesco'
                        onClick={() => window.open(TESCO_URL, '_blank')}
                    />
                ]}
                modal={false}
                open={this.state.openSummary}
                onRequestClose={() => this.openDialog()}
                actionsContainerClassName='trolley-dialog-actions'
            >
                <div className='trolley-dialog' >
                    <p>We have added {added} of {all} products to your cart!</p>

                    {diff && <div className='failed'>
                        <p>Following products are not available:</p>
                        {this.props.favourites
                            .filter(f => this.getSelectedIds().some(id => id === f.id))
                            .filter(f => !this.state.result.some(id => id === f.id))
                            .map(f => <li key={f.id}>
                                <IconButton
                                    tooltip='Go to tesco'
                                    tooltipPosition='top-right'
                                    onClick={() => window.open(PRODUCT_URL + f.id, '_blank')}
                                >
                                    <Info />
                                </IconButton>
                                <IconButton
                                    tooltip='Delete from favourites'
                                    tooltipPosition='top-right'
                                    onClick={() => this.deleteFavourite(f.id)}
                                >
                                    <Delete />
                                </IconButton>
                                {f.name}
                            </li>)}
                    </div>}
                    <p>Your cart is ready!</p>
                </div>
            </Dialog >
        )
    }
    openDialog(openModal: boolean = true) {
        this.setState(() => ({ openModal, email: '', password: '' }))
    }

    openSummary(openSummary: boolean = true) {
        this.setState(() => ({ openSummary }))
    }

    Snack = () => (
        <Snackbar
            open={this.state.openSnack}
            message={this.state.snackMsg}
            action={this.state.snackAction}
            onActionClick={this.state.onSnackAction}
            autoHideDuration={2500}
            onRequestClose={() => this.setState(() => ({ openSnack: false }))}
        />
    )

    openSnack(snackMsg: string, action?: string, onActionClick?: () => void) {
        if (action && onActionClick) {
            this.setState(() => ({ snackAction: action, onSnackAction: onActionClick }))
        }
        this.setState(() => ({ snackMsg, openSnack: true }))
    }

    Navigation = () => (
        <Paper className='bottom-bar' zDepth={1}>
            <BottomNavigation selectedIndex={this.state.selectedIndex}>
                <BottomNavigationItem
                    label='Search for products'
                    icon={<ActionAddShoppingCart />}
                    onClick={() => this.select(0)}
                />
                <BottomNavigationItem
                    label='Favorites'
                    icon={<ActionFavorite />}
                    onClick={() => this.select(1)}
                />
            </BottomNavigation>
        </Paper>
    )

    Loader = () => (
        <div className='loader' >
            <CircularProgress color='orange' size={80} thickness={5} />
            {this.state.progress > 0 && <LinearProgress mode='determinate' value={this.getProgress()} color='orange' />}
        </div>
    )

    getProgress() {
        const steps = Math.ceil(this.getSelectedIds().length / 30)
        const step = Math.ceil(100 / steps)
        return step * (steps - this.state.progress + 1)
    }

    startLoading() {
        this.setState(() => ({ loading: true }))
    }

    stopLoading() {
        this.setState(() => ({ loading: false }))
    }

    select(index: number) {
        this.setState(() => ({ selectedIndex: index }))
    }

    searchProducts(query: string) {
        this.startLoading()
        api.searchProducts(query, 1, this.props.token)
            .then(res => this.props.receivedProducts(res.data.products)
                && this.props.receivedCount(res.data.count))
            .catch(res => this.openSnack(res.response.data))
            .then(_ => this.stopLoading())
    }

    loadMore(query: string, page: number) {
        this.startLoading()
        api.searchProducts(query, page, this.props.token)
            .then(res => this.props.receivedProducts([...this.props.products, ...res.data.products]))
            .catch(res => this.openSnack(res.response.data))
            .then(_ => this.stopLoading())
    }

    getFavourites() {
        this.startLoading()
        api.getFavourites(this.props.token)
            .then(res => {
                const favourites: Product[] = res.data.favourites
                favourites.forEach(p => p.checked = false)
                return this.props.receivedFavourites(favourites)
            })
            .catch(res => this.props.logout())
            .then(_ => this.stopLoading())
    }

    addFavourite(product: Product) {
        this.startLoading()
        api.addFavourite(product, this.props.token)
            .then(res => this.props.receivedFavourites([...this.props.favourites, { ...product, checked: false }]))
            .catch(res => this.openSnack(res.response.data))
            .then(_ => this.stopLoading())
    }

    updateFavourite(product: Product) {
        this.startLoading()
        api.addFavourite(product, this.props.token)
            .then(res => this.props.updateFavourite(product))
            .catch(res => this.openSnack(res.response.data))
            .then(_ => this.stopLoading())
    }

    deleteFavourite(id: string) {
        this.startLoading()
        const favourites = this.props.favourites
        api.deleteFavourite(id, this.props.token)
            .then(res => this.props.receivedFavourites(favourites.filter(fav => fav.id !== id)))
            .catch(res => res.response.status === 401
                ? this.openSnack('Admin access required')
                : this.openSnack(res.response.data))
            .then(_ => this.stopLoading())
    }

    // buildTrolley() {
    //     this.startLoading()
    //     const ids = this.getSelectedIds()
    //     api.buildTrolley(ids, this.state.email, this.state.password, this.props.token)
    //         .then(res => this.trolleyReady(res.data.result))
    //         .catch(res => res.response.status === 403 ? this.openSnack(res.response.data) : this.trolleyError(res))
    //         .then(_ => this.stopLoading())
    // }

    buildTrolley() {
        const ids = this.getSelectedIds()
        this.progress(Math.ceil(ids.length / 30))
        this.build(ids)
    }

    progress(progress: number) {
        this.setState(() => ({ progress }))
    }

    done() {
        this.setState(() => ({ progress: this.state.progress - 1 }))
    }

    build(input: string[], i: number = 0, result: string[] = []) {
        const head = input.slice(0, 30)
        const tail = input.slice(30, input.length)

        api.buildTrolley(head, this.state.email, this.state.password, this.props.token)
            .then(res => tail.length > 0
                ? this.build(tail, i + 1, [...result, ...res.data.result])
                : this.trolleyReady([...result, ...res.data.result]))
            .catch(res => res.response.status === 403 ? this.openSnack(res.response.data) : this.trolleyError(res))
            .then(_ => this.done())
    }

    getSelectedIds() {
        return this.props.favourites.filter(f => f.checked).map(f => f.id)
    }

    trolleyReady(result: string[]) {
        this.setState(() => ({ result, openModal: false, openSummary: true }))
    }

    trolleyError(err: any) {
        this.progress(0)
        this.openSnack('Error - contact admin with console logs')
        console.log(err)
    }
}

function mapStateToProps(state: RootState) {
    const { products, favourites, isLoggedIn, token, count } = state.shopper
    return {
        products,
        count,
        favourites,
        isLoggedIn,
        token
    }
}

function mapDispatchToProps(dispatch: any) {
    return {
        receivedProducts: (products: Product[]) => dispatch(actions.receivedProducts(products)),
        receivedCount: (count: number) => dispatch(actions.receivedCount(count)),
        receivedFavourites: (products: Product[]) => dispatch(actions.receivedFavourites(products)),
        updateFavourite: (product: Product) => dispatch(actions.updateFavourite(product)),
        logout: () => dispatch(actions.logout())
    }
}