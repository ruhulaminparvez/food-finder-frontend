import { gql } from '@apollo/client';

export const GET_MENU_BY_RESTAURANT = gql`
  query GetMenuByRestaurant($restaurantId: ID!) {
    getMenuByRestaurant(restaurantId: $restaurantId) {
      id
      restaurantId
      name
      description
      price
      category
      image
      createdAt
      updatedAt
    }
  }
`;
