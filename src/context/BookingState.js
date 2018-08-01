// @flow
/* eslint-disable react/no-unused-state */

import * as React from 'react';

import type { onLogout } from '../types';

const initialState = {
  FAQSection: 'BEFORE_BOOKING',
  bookingPage: 'SINGLE_BOOKING',
  selectedBooking: null,
};

export type FAQSectionType =
  | 'BEFORE_BOOKING'
  | 'UPCOMING_BOOKING'
  | 'URGENT_BOOKING'
  | 'PAST_BOOKING';

type Props = {
  children: React.Node,
  onLogout: onLogout,
};

type StateValues = {
  FAQSection: FAQSectionType,
  bookingPage: 'SINGLE_BOOKING' | 'ALL_BOOKINGS',
  selectedBooking: ?number,
};

type StateCallbacks = {
  onDisplayAll: () => void,
  onSelectBooking: (id: number) => void,
  onSetFAQSection: (isUrgent: boolean, isPastBooking: boolean) => void,
  onLogout: onLogout,
};

export type BookingStateType = StateValues & StateCallbacks;

export const BookingState = React.createContext({
  ...initialState,
  onDisplayAll: () => {},
  onSelectBooking: (id: number) => {}, // eslint-disable-line no-unused-vars
  onSetFAQSection: (isUrgent: boolean, isPastBooking: boolean) => {}, // eslint-disable-line no-unused-vars
  onLogout: () => Promise.resolve(true),
});

class BookingStateProvider extends React.Component<Props, BookingStateType> {
  constructor(props: Props) {
    super(props);

    this.state = {
      ...initialState,
      onLogout: this.onLogout,
      onSelectBooking: this.onClickSelect,
      onDisplayAll: this.onClickAllBooking,
      onSetFAQSection: this.onSetFAQSection,
    };
  }

  onLogout = async () => {
    await this.props.onLogout();
    this.setState({ FAQSection: 'BEFORE_BOOKING' });
  };

  onClickAllBooking = () => {
    this.setState({ bookingPage: 'ALL_BOOKINGS' });
  };

  onClickSelect = (id: number) => {
    this.setState({ bookingPage: 'SINGLE_BOOKING', selectedBooking: id });
  };

  onSetFAQSection = (isUrgent: boolean, isPastBooking: boolean) => {
    let section = 'UPCOMING_BOOKING';

    if (isUrgent) {
      section = 'URGENT_BOOKING';
    } else if (isPastBooking) {
      section = 'PAST_BOOKING';
    }

    this.setState(({ FAQSection }) => {
      if (FAQSection !== section) {
        return { FAQSection: section };
      }
    });
  };

  render() {
    return (
      <BookingState.Provider value={this.state}>
        {this.props.children}
      </BookingState.Provider>
    );
  }
}

export const withLogout = <Props>(
  Component: React.ComponentType<{ onLogout: onLogout } & Props>,
) =>
  function withLogoutHOC(props: Props) {
    return (
      <BookingState.Consumer>
        {({ onLogout }: BookingStateType) => (
          <Component {...props} onLogout={onLogout} />
        )}
      </BookingState.Consumer>
    );
  };

export default BookingStateProvider;