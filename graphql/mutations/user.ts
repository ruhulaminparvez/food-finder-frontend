import { gql } from '@apollo/client';

export const UPDATE_PREFERENCES = gql`
  mutation UpdatePreferences($input: UpdatePreferencesInput!) {
    updatePreferences(input: $input) {
      id
      preferences {
        cuisine
        priceRange {
          min
          max
        }
        maxDistance
      }
    }
  }
`;

export const UPDATE_LOCATION = gql`
  mutation UpdateLocation($location: LocationInput!) {
    updateLocation(location: $location) {
      id
      location {
        lat
        lng
      }
    }
  }
`;

export const ADD_FAVORITE_RESTAURANT = gql`
  mutation AddFavoriteRestaurant($restaurantId: ID!) {
    addFavoriteRestaurant(restaurantId: $restaurantId) {
      id
      favoriteRestaurants {
        id
        name
        cuisineType
        rating {
          average
          count
        }
        images
      }
    }
  }
`;

export const REMOVE_FAVORITE_RESTAURANT = gql`
  mutation RemoveFavoriteRestaurant($restaurantId: ID!) {
    removeFavoriteRestaurant(restaurantId: $restaurantId) {
      id
      favoriteRestaurants {
        id
        name
      }
    }
  }
`;

export const ADD_REVIEW = gql`
  mutation AddReview($input: CreateReviewInput!) {
    addReview(input: $input) {
      id
      userId
      restaurantId
      rating
      comment
      createdAt
    }
  }
`;
