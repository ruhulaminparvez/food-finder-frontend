import { gql } from '@apollo/client';

export const GET_ME = gql`
  query GetMe {
    me {
      id
      name
      email
      role
      preferences {
        cuisine
        priceRange {
          min
          max
        }
        maxDistance
      }
      location {
        lat
        lng
      }
      createdAt
    }
  }
`;

export const GET_USER_FAVORITES = gql`
  query GetUserFavorites {
    getUserFavorites {
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

export const GET_USER_RECOMMENDATIONS = gql`
  query GetUserRecommendations($limit: Int) {
    getUserRecommendations(limit: $limit) {
      restaurant {
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
      score
      reasons
    }
  }
`;
