import { gql } from '@apollo/client';

export const GET_REVIEWS_BY_RESTAURANT = gql`
  query GetReviewsByRestaurant($restaurantId: ID!, $limit: Int, $offset: Int) {
    getReviewsByRestaurant(restaurantId: $restaurantId, limit: $limit, offset: $offset) {
      id
      userId
      user {
        id
        name
        email
      }
      restaurantId
      rating
      comment
      createdAt
      updatedAt
    }
  }
`;
