import { gql } from '@apollo/client';

export const GET_RESTAURANTS = gql`
  query GetRestaurants($filter: RestaurantFilter, $limit: Int, $offset: Int) {
    getRestaurants(filter: $filter, limit: $limit, offset: $offset) {
      id
      name
      description
      cuisineType
      location {
        lat
        lng
      }
      address
      rating {
        average
        count
      }
      crowdLevel
      openingHours {
        day
        open
        close
        isClosed
      }
      images
      createdAt
    }
  }
`;

export const GET_RESTAURANT_BY_ID = gql`
  query GetRestaurantById($id: ID!) {
    getRestaurantById(id: $id) {
      id
      name
      description
      cuisineType
      location {
        lat
        lng
      }
      address
      rating {
        average
        count
      }
      crowdLevel
      openingHours {
        day
        open
        close
        isClosed
      }
      images
      ownerId
      crowdData {
        id
        currentVisitors
        crowdLevel
        lastUpdated
      }
      createdAt
      updatedAt
    }
  }
`;

export const SEARCH_RESTAURANTS = gql`
  query SearchRestaurants($keyword: String!, $limit: Int, $offset: Int) {
    searchRestaurants(keyword: $keyword, limit: $limit, offset: $offset) {
      id
      name
      description
      cuisineType
      location {
        lat
        lng
      }
      address
      rating {
        average
        count
      }
      crowdLevel
      images
    }
  }
`;

export const GET_NEARBY_RESTAURANTS = gql`
  query GetNearbyRestaurants($location: LocationInput!, $radius: Float!, $limit: Int) {
    getNearbyRestaurants(location: $location, radius: $radius, limit: $limit) {
      id
      name
      description
      cuisineType
      location {
        lat
        lng
      }
      address
      rating {
        average
        count
      }
      crowdLevel
      images
    }
  }
`;

export const GET_LIVE_CROWD_DATA = gql`
  query GetLiveCrowdData($restaurantId: ID!) {
    getLiveCrowdData(restaurantId: $restaurantId) {
      id
      currentVisitors
      crowdLevel
      lastUpdated
    }
  }
`;
