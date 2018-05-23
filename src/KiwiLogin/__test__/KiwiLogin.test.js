// @flow
import * as React from 'react';
import { shallow } from 'enzyme';

import { PureKiwiLogin } from '../index';

describe('KiwiLogin', () => {
  const props = {
    onLogin: () =>
      new Promise(resolve => {
        process.nextTick(() => resolve());
      }),
    history: {
      push: jest.fn(),
    },
  };
  const e = {
    preventDefault: jest.fn(),
  };

  const wrapper = shallow(<PureKiwiLogin {...props} />);
  it('should change state', () => {
    const Login = wrapper.instance();
    const state = Login.state;
    expect(state).toEqual({ email: '', password: '', showError: false });

    wrapper.find(`[type="email"]`).simulate('change', {
      target: { name: 'email', value: 'email@kiwi.com' },
    });
    wrapper.find(`[type="password"]`).simulate('change', {
      target: { name: 'password', value: 'myRealPassword' },
    });

    expect(Login.state).toMatchSnapshot();
  });

  it('should handle sign in', async () => {
    const Login = wrapper.instance();
    await Login.handleSignIn(e);
    expect(e.preventDefault.mock.calls).toHaveLength(1);
    expect(Login.props.history.push.mock.calls[0][0]).toBe('/content');
  });

  it('should handle error in sign in', async () => {
    const errorProps = {
      history: {
        push: jest.fn(),
      },
      onLogin: () =>
        new Promise((resolve, reject) => {
          process.nextTick(() => reject());
        }),
    };

    const LoginWrapper = shallow(<PureKiwiLogin {...errorProps} />);
    const Login = LoginWrapper.instance();
    expect(Login.state.showError).toBe(false);

    await Login.handleSignIn(e);

    expect(Login.props.history.push.mock.calls).toHaveLength(0);
    expect(Login.state.showError).toBe(true);
  });

  it('should match snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });
});
