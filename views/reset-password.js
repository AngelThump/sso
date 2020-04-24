import 'babel-polyfill';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import ReactPasswordStrength from 'react-password-strength';

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {

        };
    }

    componentDidMount() {

    }

    handleRegPassword = (state) => {
        this.setState({ password: state.password, passLength: state.password.length, isPasswordValid: state.isValid })
    }

    render() {
        <div className="container">
            <div className="authorize">
                <div className="wrap js-login-contain">
                    <div className="header clearfix">
                        <img width="100%" height="100%" src="/assets/logo_small.png"></img>
                    </div>
                    <div className="card">
                        <div className="text-content">
                            <div className="content-header">
                                <h4>Set New Password</h4>
                                <p className="subtext">
                                    Set a new password for your account.
                                    <br>
                                    Resetting your password will also invalidate your existing stream keys.
                                    </br>
                                </p>
                            </div>

                            <div className="item">
                                <form method="put" action="/v1/user/reset/password">
                                    <input id="hash" type="hidden" value={this.props.hash}/>
                                    <div className="password-container field item">
                                        <label htmlFor="password">New Password</label>
                                        <ReactPasswordStrength
                                            style={{border: '0'}}
                                            minLength={6}
                                            minScore={2}
                                            scoreWords={['weak', 'fair', 'good', 'strong']}
                                            changeCallback={this.handlePassword}
                                            inputProps={{ "aria-label":"Enter a secure password", type: "password", id:"password", name: "password_input", autoComplete: "off", autoCapitalize: "off", autoCorrect: "off",
                                        }}/>
                                    </div>
                                    <div className="buttons">
                                        <button type="submit" className="primary button js-password-reset" disabled={this.state.isPasswordValid ? null : "disabled"}>
                                            <span className="js-password-reset-text">
                                                Change Password
                                            </span>
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div> 
    }
}

const pathname = window.location.pathname;
const hash = pathname.substring(pathname.lastIndexOf('/')+1, pathname.length-1);
console.log(hash);

ReactDOM.render(
  <React.StrictMode>
    <App hash={hash}/>
  </React.StrictMode>,
  document.getElementById('root')
);