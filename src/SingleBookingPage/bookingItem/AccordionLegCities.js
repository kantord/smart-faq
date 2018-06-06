// @flow

import * as React from 'react';
import css from 'styled-jsx/css';
import idx from 'idx';
import { CarrierLogo } from '@kiwicom/orbit-components';
// import { ShowMore } from '@kiwicom/orbit-components/lib/icons';
import { createFragmentContainer, graphql } from 'react-relay';

import { formatHour, formatTimeDuration } from '../../helpers/dateUtils';
import type { AccordionLegCities_leg } from './__generated__/AccordionLegCities_leg.graphql';

const citiesStyle = css`
  div.legCities {
    border: 1px solid #e9eef2;
    display: flex;
    position: relative;
    width: 294px;
    margin-bottom: 15px;
    align-items: space-between;
    padding: 7px 13px;
  }
  div.cities {
    width: 294px;
  }
  div.city {
    color: #7c8b99;
  }
  div.showMoreIcon {
    position: absolute;
    right: -7px;
    top: 13px;
    background: #fff;
  }
  span.flightLength {
    font-size: 11px;
    position: absolute;
    bottom: -8px;
    padding-left: 1em;
    padding-right: 6px;
    right: 8px;
    background: #fff;
    color: #7c8b99;
  }
  div.citiesArrow {
    border: none;
    position: absolute;
    top: 40%;
    left: -5px;
  }
  div.citiesArrow div.arrows {
    position: relative;
  }
  div.citiesArrow .visibleArrow {
    position: absolute;
    height: 10px;
    width: 10px;
    border: 1px solid #e9eef2;
    transform: rotate(45deg);
  }
  div.citiesArrow .mask {
    position: absolute;
    height: 10px;
    width: 10px;
    border: 1px solid #fff;
    background: #fff;
    left: 2px;
    transform: rotate(45deg);
  }
  div.departure,
  div.arrival {
    display: flex;
  }
  div.departure div.time,
  div.arrival div.time {
    width: 5em;
    margin-right: 12px;
  }
`;

type LegProps = {|
  leg: AccordionLegCities_leg,
|};

const LegCities = (props: LegProps) => {
  const { leg } = props;
  const { departure, arrival } = leg;
  const departureTime = (departure && departure.localTime) || '';
  const departureCityName = idx(departure, _ => _.airport.city.name) || '';
  const departureCityCode = idx(departure, _ => _.airport.locationId) || '';
  const arrivalTime = (arrival && arrival.localTime) || '';
  const arrivalCityName = idx(arrival, _ => _.airport.city.name) || '';
  const arrivalCityCode = idx(arrival, _ => _.airport.locationId) || '';
  const carrier = {
    code: idx(leg.airline, _ => _.code) || '',
    name: idx(leg.airline, _ => _.name) || '',
  };
  return (
    <div className="legCities">
      <div className="cities">
        <div className="departure">
          <div className="time">{formatHour(departureTime)}</div>
          <div className="city">
            {`${departureCityName} ${departureCityCode}`}
          </div>
        </div>
        <div className="arrival">
          <div className="time">{formatHour(arrivalTime)}</div>
          <div className="city">{`${arrivalCityName} ${arrivalCityCode}`}</div>
        </div>
      </div>
      <div className="carrier">
        <CarrierLogo size="large" carriers={[carrier]} />
      </div>
      {/* This is commented out because of https://github.com/kiwicom/smart-faq/issues/307
      <div className="showMoreIcon">
        <ShowMore customColor="#94a2b0" size="12" />
      </div> */}
      <span className="flightLength">
        {formatTimeDuration(leg.duration || 0)}
      </span>
      <div className="citiesArrow">
        <div className="arrows">
          <div className="visibleArrow" />
          <div className="mask" />
        </div>
      </div>
      <style jsx>{citiesStyle}</style>
    </div>
  );
};

export default createFragmentContainer(
  LegCities,
  graphql`
    fragment AccordionLegCities_leg on Leg {
      duration
      airline {
        code
        name
      }
      arrival {
        localTime
        airport {
          locationId
          name
          city {
            name
          }
        }
      }
      departure {
        localTime
        airport {
          locationId
          name
          city {
            name
          }
        }
      }
    }
  `,
);
