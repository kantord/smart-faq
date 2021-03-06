// @flow

import * as React from 'react';
import { graphql } from 'react-relay';
import idx from 'idx';

import BookingRenderer from '../relay/BookingRenderer';
import BookingError from './BookingError';
import BookingDetail from './BookingDetail';
import BookingNotFound from './BookingNotFound';
import BookingLoader from './BookingLoader';
import bookingTypes from '../common/booking/bookingTypes';
import { UserContext } from '../context/User';
import type { UserContextType } from '../context/User';
import type { SelectedBookingQuery } from './__generated__/SelectedBookingQuery.graphql';
import type { SelectedBookingBySimpleTokenQuery } from './__generated__/SelectedBookingBySimpleTokenQuery.graphql';

type Props = {|
  bookingId: number,
|};

type RenderState = {
  props: SelectedBookingQuery | SelectedBookingBySimpleTokenQuery,
  error: ?Error,
};

const selectedBookingQuery = graphql`
  query SelectedBookingQuery($id: ID!) {
    booking(id: $id) {
      type
      oneWay {
        ...BookingDetail_booking
        ...GuaranteeNeededResolver_booking
      }
      return {
        ...BookingDetail_booking
        ...GuaranteeNeededResolver_booking
      }
      multicity {
        ...BookingDetail_booking
        ...GuaranteeNeededResolver_booking
      }
    }
  }
`;

const singleBookingQuery = graphql`
  query SelectedBookingBySimpleTokenQuery($id: Int!, $authToken: String!) {
    singleBooking(id: $id, authToken: $authToken) {
      type
      ...BookingDetail_booking
      ...GuaranteeNeededResolver_booking
    }
  }
`;

class SelectedBooking extends React.Component<Props> {
  renderSelectedBooking = (renderState: RenderState) => {
    const bookingType =
      idx(renderState.props, _ => _.booking.type) ||
      idx(renderState.props, _ => _.singleBooking.type);

    let content = null;
    let booking = null;

    switch (bookingType) {
      case bookingTypes.ONE_WAY:
        booking =
          idx(renderState.props, _ => _.booking.oneWay) ||
          idx(renderState.props, _ => _.singleBooking);
        break;
      case bookingTypes.RETURN:
        booking =
          idx(renderState.props, _ => _.booking.return) ||
          idx(renderState.props, _ => _.singleBooking);
        break;
      case bookingTypes.MULTICITY:
        booking =
          idx(renderState.props, _ => _.booking.multicity) ||
          idx(renderState.props, _ => _.singleBooking);
        break;
    }

    if (booking) {
      content = <BookingDetail booking={booking} />;
    } else {
      content = <BookingNotFound />;
    }

    if (!renderState.props) {
      content = <BookingLoader />;
    }

    if (renderState.error) {
      content = <BookingError />;
    }

    return (
      <div style={{ height: '100%', backgroundColor: '#f5f7f9' }}>
        {content}
      </div>
    );
  };

  render() {
    const { bookingId } = this.props;

    return (
      <UserContext.Consumer>
        {({ simpleToken, loginToken }: UserContextType) => {
          if (loginToken) {
            return (
              <BookingRenderer
                query={selectedBookingQuery}
                variables={{ id: bookingId }}
                render={this.renderSelectedBooking}
              />
            );
          }
          if (simpleToken) {
            return (
              <BookingRenderer
                query={singleBookingQuery}
                variables={{ id: bookingId, authToken: simpleToken }}
                render={this.renderSelectedBooking}
              />
            );
          }
          return <BookingError />;
        }}
      </UserContext.Consumer>
    );
  }
}

export default SelectedBooking;
