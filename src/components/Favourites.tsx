import * as React from 'react'
import { List, ListItem, Avatar, Checkbox, TextField, 
    RaisedButton, IconButton, Toggle, IconMenu, MenuItem  } from 'material-ui'
import Delete from 'material-ui/svg-icons/action/delete'
import Check from 'material-ui/svg-icons/av/playlist-add-check'

const TAGS = ['PAŁAC', 'MAŁY_DOMEK', 'GDAŃSK']

interface Props {
    favourites: Product[]
    deleteFavourite: (id: string) => void
    updateFavourite: (fav: Product) => void
    toggleFavourite: (fav: Product) => void
    buildTrolley: () => void
}

interface State {
    filter: string
    selectAll: boolean
    tagMenuOpen: boolean
}

const PRODUCT_URL = 'https://ezakupy.tesco.pl/groceries/pl-PL/products/'

export class FavouritesComponent extends React.Component<Props, State>  {
    state = {
        filter: '',
        selectAll: true,
        tagMenuOpen: false
    }

    updateTags(tags: string[], tag: string) {
        if (!tags) {
            return [tag]
        }

        const index = tags.indexOf(tag)
        if (index > -1) {
            tags.splice(index, 1)
            return tags
        }
        return [...tags, tag].sort()
    }

    getTags(p: Product) {
        return p.tags ? ` ( ${p.tags.join(', ')} )` : ''
    }

    getNested(p: Product) {
        const tags: JSX.Element[] = TAGS.map(tag => (
            <ListItem
                key={tag}
                primaryText={tag}
                onClick={() => this.props.updateFavourite({...p, tags: this.updateTags(p.tags, tag)})}
                leftIcon={<Toggle toggled={p.tags && p.tags.some(t => t === tag)} />}
            />)
        )
        tags.push(
            <ListItem
                disabled
                key='last'
                primaryText='Delete'
                leftIcon={<Delete className='clickable' onClick={e => this.props.deleteFavourite(p.id)} />}
            />
        )
        return tags
    }

    openMenu(flag: boolean = true) {
        this.setState({tagMenuOpen: flag})
    }
    
    toggleTag(tag: string) {
        const { favourites, toggleFavourite} = this.props
        favourites.forEach(f => toggleFavourite({...f, checked: f.tags ? f.tags.some(t => t === tag) : false}))
    }
    
    render() {
        const { favourites, toggleFavourite, buildTrolley } = this.props
        const filter = this.state.filter.toLowerCase()
        const filtered = favourites.filter(f => f.name.toLowerCase().includes(filter))
        return (
            <div>
                <div className='favourites-actions'>
                    <TextField
                        hintText='Filter favourites...'
                        value={this.state.filter}
                        onChange={(e, value) => this.setState(() => ({ filter: value }))}
                    />
                    <IconButton
                        tooltip='Select/deselect all'
                        onClick={() => favourites
                            .forEach(f => toggleFavourite({ ...f, checked: this.state.selectAll }))
                            || this.setState(() => ({ selectAll: !this.state.selectAll }))
                        }
                    >
                        <Check />
                    </IconButton>

                    <IconMenu
                        iconButtonElement={<RaisedButton label='Select by tag...' onClick={() => this.openMenu()}/>}
                        open={this.state.tagMenuOpen}
                        onRequestChange={x => this.openMenu(x)}
                        onItemClick={(_e, item: any) => this.toggleTag(item.key)}
                    >
                        {TAGS.map(tag => <MenuItem key={tag} primaryText={tag} />)}
                    </IconMenu>

                    <RaisedButton
                        primary
                        label='Add selected to cart...'
                        disabled={!favourites.some(f => f.checked === true)}
                        onClick={() => buildTrolley()}
                    />
                </div>
                {filtered.length === 0 && <div className='not-found'>
                    <img src='assets/notfound.jpg' />
                    <p>No favourites found.</p>
                </div>}
                <List>
                    {filtered.map(p => (
                        <ListItem
                            style={{ marginLeft: 50 }}
                            key={p.id}
                            primaryText={p.name}
                            secondaryText={`${p.price} zł${this.getTags(p)}`}
                            leftAvatar={<Avatar
                                style={{ marginLeft: -60, cursor: 'help' }}
                                src={p.photo}
                                onClick={e => e.preventDefault() || window.open(PRODUCT_URL + p.id, '_blank')}
                            />}
                            nestedItems={this.getNested(p)}
                            leftCheckbox={<Checkbox
                                checked={p.checked}
                                onCheck={(e, value) => toggleFavourite({ ...p, checked: !p.checked })}
                            />}
                        />))}
                </List>
            </div >
        )
    }
}