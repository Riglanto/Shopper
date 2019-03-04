
import * as React from 'react'
import history from '../History'
import { RootState } from '../reducers'
import { connect } from 'react-redux'
import { GoogleLogin } from 'react-google-login'
import { login } from '../actions/shopper'
import * as ReactGA from 'react-ga'
import './Login.css'

interface Props {
    isLoggedIn: boolean
    logIn: (token: string) => void
}

@connect(mapStateToProps, mapDispatchToProps)
export class LoginComponent extends React.Component<Props> {
    componentWillMount() {
        const token = sessionStorage.getItem('token')
        if (token) {
            this.props.logIn(token)
        }
    }
    componentDidUpdate() {
        if (this.props.isLoggedIn) {
            history.push('/')
        }
    }
    render() {
        return (
            <div className='login'>
                <img className='hello' src='assets/hello.jpg' />
                <GoogleLogin
                    clientId='681477670925-s8ro20issrc89chsqe7g61aji0csn97a.apps.googleusercontent.com'
                    buttonText='Login'
                    onSuccess={this.onSuccess}
                    onFailure={this.onFailure}
                />
            </div>
        )
    }

    private onSuccess = (response: any) => {
        const token = response.tokenId
        this.props.logIn(token)
        const name = `${response.profileObj.givenName} ${response.profileObj.familyName}`
        ReactGA.event({
            category: 'User',
            action: 'Log in',
            label: name
        })
        sessionStorage.setItem('name', name)
    }

    private onFailure = (response: any) => {
        console.log(response)
    }
}

function mapStateToProps(state: RootState) {
    const { isLoggedIn } = state.shopper
    return {
        isLoggedIn
    }
}

function mapDispatchToProps(dispatch: any) {
    return {
        logIn: (token: string) => dispatch(login(token))
    }
}
