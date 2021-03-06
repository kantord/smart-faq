// @flow

import * as React from 'react';
import css from 'styled-jsx/css';
import idx from 'idx';
import classNames from 'classnames';
import { Text } from '@kiwicom/orbit-components';
import {
  Search,
  Trip,
  AccountCircle,
  Close,
} from '@kiwicom/orbit-components/lib/icons';
import { withRouter } from 'react-router-dom';

import { UserContext } from '../context/User';
import { SearchState } from '../context/SearchState';
import { SelectedBooking } from '../context/SelectedBooking';
import { CloseContext } from '../context/Close';
import BackButtonMobile from './BackButtonMobile';
import MobileNearestBooking from './MobileNearestBooking';
import MobileSelectedBooking from './MobileSelectedBooking';
import MobileUserDetail from './MobileUserDetail';
import type { UserContextType } from '../context/User';
import type { SearchStateType } from '../context/SearchState';

type MobileBookingPageProps = {|
  +bookingPage: string,
  +selectedBooking: ?number,
|};

const MobileBookingPage = (props: MobileBookingPageProps) => {
  const { bookingPage, selectedBooking } = props;
  if (bookingPage === 'SINGLE_BOOKING') {
    if (selectedBooking) {
      return <MobileSelectedBooking bookingId={selectedBooking} />;
    }

    return <MobileNearestBooking />;
  }

  return null;
};

const MobileBookingSummary = () => (
  <div>
    <SelectedBooking.Consumer>
      {({ bookingPage, selectedBooking }) => (
        <MobileBookingPage
          bookingPage={bookingPage}
          selectedBooking={selectedBooking}
        />
      )}
    </SelectedBooking.Consumer>
  </div>
);

const MobileBookingHeaderStyle = css`
  .MobileBookingHeader {
    display: flex;
    background-color: #f5f7f9;
    box-shadow: inset 0 1px 0 0 #e8edf1;
  }
  .option {
    flex: 1;
    padding: 19px;
    text-align: center;
    background-color: #fff;
    border: 1px solid #eaeaea;
    outline: none;
  }
  .option.help {
    display: none;
  }
  .option.active {
    background-color: #f5f7f9;
  }
  .openedContent {
    display: flex;
    flex-direction: column;
    background-color: #f5f7f9;
    box-shadow: inset 0 1px 0 0 #e8edf1;
    padding: 8px 16px;
  }
  .openedContent.hidden {
    display: none;
  }

  @media screen and (max-height: 480px) {
    .option.help {
      flex: 7;
      display: flex;
    }
  }
`;

type Props = {|
  match: {
    params: {
      categoryId: ?string,
    },
  },
  history: {
    goBack: () => void,
    push: string => void,
    location: {
      pathname: string,
    },
    entries: Array<{
      pathname: string,
    }>,
  },
|};

type State = {
  activeTab: 'search' | 'summary' | 'account' | null,
};

class MobileBookingHeader extends React.Component<Props, State> {
  state: State = {
    activeTab: null,
  };

  componentDidMount() {
    this.contextToggleSearch();
  }

  contextEnableSearch = () => {};
  contextDisableSearch = () => {};
  contextToggleSearch = () => {};

  toggleSearch = () => {
    if (this.isSearchActive()) {
      this.setState({
        activeTab: null,
      });
      this.contextDisableSearch();
    } else {
      this.setState({
        activeTab: 'search',
      });
      this.props.history.push('/faq/');
      this.contextEnableSearch();
    }
  };

  toggleSummary = () => {
    this.setState(prevState => ({
      activeTab: prevState.activeTab === 'summary' ? null : 'summary',
    }));
    this.contextDisableSearch();
  };

  toggleAccount = () => {
    this.setState(prevState => ({
      activeTab: prevState.activeTab === 'account' ? null : 'account',
    }));
    this.contextDisableSearch();
  };

  goBack = () => {
    const { history } = this.props;
    const pathname = history.location.pathname;

    if (pathname.includes('search')) {
      return history.push('/faq');
    }

    if (pathname.includes('article')) {
      const url = idx(pathname.match(/(.*)(?=article)/), _ => _[0]) || '';
      return history.push(url);
    } else if (pathname.includes('faq')) {
      return history.push('/faq');
    }
  };

  isSearchActive() {
    return (
      this.state.activeTab === 'search' &&
      this.props.history.location.pathname === '/faq/'
    );
  }

  render() {
    return (
      <React.Fragment>
        <SelectedBooking.Consumer>
          {({ closeAllBooking }) => (
            <SearchState.Consumer>
              {({
                disableSearch,
                enableSearch,
                toggleSearch,
              }: SearchStateType) => {
                this.contextEnableSearch = enableSearch;
                this.contextDisableSearch = disableSearch;
                this.contextToggleSearch = toggleSearch;
                const { location } = this.props.history;
                const currentpath = location && location.pathname;
                const isArticle = currentpath.includes('article/');
                const hasCategory =
                  idx(this.props.match, _ => _.params.categoryId) || null;
                const buttonEvent = eventHandler => () => {
                  eventHandler();
                  closeAllBooking();
                };

                return (
                  <div className="MobileBookingHeader">
                    {isArticle || hasCategory ? (
                      <div
                        className="option"
                        onClick={buttonEvent(this.goBack)}
                        onKeyUp={buttonEvent(this.goBack)}
                        role="button"
                        tabIndex="-1"
                      >
                        <BackButtonMobile />
                      </div>
                    ) : null}
                    <div className="option help">
                      <Text type="primary" weight="bold">
                        Help
                      </Text>
                    </div>
                    <div
                      className={
                        this.isSearchActive() ? 'option active' : 'option'
                      }
                      onClick={buttonEvent(this.toggleSearch)}
                      onKeyDown={buttonEvent(this.toggleSearch)}
                      role="button"
                      tabIndex="0"
                      data-cy="search-button"
                    >
                      <Search size="medium" customColor="#45505d" />
                    </div>
                    <div
                      className={
                        this.state.activeTab === 'summary'
                          ? 'option active'
                          : 'option'
                      }
                      onClick={buttonEvent(this.toggleSummary)}
                      onKeyDown={buttonEvent(this.toggleSummary)}
                      role="button"
                      tabIndex="0"
                      data-cy="trip-button"
                    >
                      <Trip size="medium" customColor="#45505d" />
                    </div>
                    <UserContext.Consumer>
                      {({ simpleToken }: UserContextType) =>
                        !simpleToken && (
                          <div
                            className={
                              this.state.activeTab === 'account'
                                ? 'option active'
                                : 'option'
                            }
                            onClick={buttonEvent(this.toggleAccount)}
                            onKeyDown={buttonEvent(this.toggleAccount)}
                            role="button"
                            tabIndex="0"
                          >
                            <AccountCircle
                              size="medium"
                              customColor="#45505d"
                            />
                          </div>
                        )
                      }
                    </UserContext.Consumer>
                    <CloseContext.Consumer>
                      {(onClose: () => void) => (
                        <div
                          className="option"
                          role="button"
                          tabIndex="0"
                          onKeyDown={onClose}
                          onClick={onClose}
                        >
                          <Close size="medium" customColor="#45505d" />
                        </div>
                      )}
                    </CloseContext.Consumer>
                  </div>
                );
              }}
            </SearchState.Consumer>
          )}
        </SelectedBooking.Consumer>
        <div
          className={classNames('openedContent', {
            hidden: this.state.activeTab !== 'summary',
          })}
        >
          <MobileBookingSummary />
        </div>
        {this.state.activeTab === 'account' ? (
          <div className="openedContent">
            <MobileUserDetail />
          </div>
        ) : null}
        <style jsx>{MobileBookingHeaderStyle}</style>
      </React.Fragment>
    );
  }
}

export default withRouter(MobileBookingHeader);
