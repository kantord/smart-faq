// @flow

/*  eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import ReactDOM from 'react-dom';
import Cookies from 'js-cookie';
import Raven from 'raven-js';

import App from './App';
import enLocale from '../i18n/en/translation.json';
import { socialLogin } from './helpers/Auth';
import { Requester } from './helpers/Requests';
import type { User } from './types';

type Props = {||};

type State = {|
  user: User,
  loginToken: ?string,
|};

const user = {
  id: '1',
  email: 'joe.doe@example.com',
  firstname: 'Joe',
  lastname: 'Doe',
};

class Root extends React.Component<Props, State> {
  cookieKey: string;

  constructor(props) {
    super(props);

    this.cookieKey = 'mockedLogin';

    const loginToken = Cookies.get(this.cookieKey);
    this.state = {
      user: loginToken ? user : null,
      loginToken,
    };
    this.setupLogs();
  }
  setupLogs = () => {
    if (
      process.env.NODE_ENV === 'production' &&
      process.env.SENTRY_URL_STAGING
    ) {
      window.Raven = Raven;
      Raven.config(process.env.SENTRY_URL_STAGING).install();
    }
  };
  onLogin = async (email, password) => {
    const loginToken = await Requester.login(email, password);
    this.setState({ user, loginToken });
    Cookies.set(this.cookieKey, loginToken);

    return Promise.resolve(user);
  };

  onSocialLogin = async provider => {
    const authUrl = await socialLogin(provider);

    if (!authUrl) {
      return;
    }

    window.location = authUrl;
  };

  onLogout = async () => {
    this.setState({ user: null, loginToken: null });
    Cookies.remove(this.cookieKey);
  };

  render() {
    const language = 'en';

    return (
      <div className="root">
        <App
          onClose={() => {}}
          onLogin={this.onLogin}
          onSocialLogin={this.onSocialLogin}
          onLogout={this.onLogout}
          language={language}
          locale={enLocale}
          user={this.state.user}
          loginToken={this.state.loginToken}
        />
        <style jsx global>
          {`
            .root {
              position: fixed;
              right: 0;
              top: 0;
            }
          `}
        </style>
      </div>
    );
  }
}

(() => {
  const root = document.createElement('div');
  root.setAttribute('id', 'root');

  if (!document.body) {
    throw new Error('No browser?');
  }

  document.body.appendChild(root);

  const id = document.getElementById('root');

  if (!id) {
    throw new Error('Root element is missing!');
  }

  ReactDOM.render(<Root />, id);
})();
