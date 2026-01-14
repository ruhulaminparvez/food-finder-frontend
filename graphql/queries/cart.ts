import { gql } from '@apollo/client';

export const GET_CART = gql`
  query GetCart($restaurantId: ID!) {
    getCart(restaurantId: $restaurantId) {
      id
      userId
      restaurantId
      restaurant {
        id
        name
        address
      }
      items {
        menuItemId
        menuItem {
          id
          name
          description
          price
          image
        }
        quantity
        price
        name
      }
      totalAmount
      createdAt
      updatedAt
    }
  }
`;

export const GET_USER_CARTS = gql`
  query GetUserCarts {
    getUserCarts {
      id
      userId
      restaurantId
      restaurant {
        id
        name
        address
      }
      items {
        menuItemId
        menuItem {
          id
          name
          description
          price
          image
        }
        quantity
        price
        name
      }
      totalAmount
      createdAt
      updatedAt
    }
  }
`;
