import { gql } from '@apollo/client';

export const ADD_TO_CART = gql`
  mutation AddToCart($restaurantId: ID!, $menuItemId: ID!, $quantity: Int) {
    addToCart(restaurantId: $restaurantId, menuItemId: $menuItemId, quantity: $quantity) {
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

export const UPDATE_CART_ITEM = gql`
  mutation UpdateCartItem($restaurantId: ID!, $menuItemId: ID!, $quantity: Int!) {
    updateCartItem(restaurantId: $restaurantId, menuItemId: $menuItemId, quantity: $quantity) {
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

export const REMOVE_FROM_CART = gql`
  mutation RemoveFromCart($restaurantId: ID!, $menuItemId: ID!) {
    removeFromCart(restaurantId: $restaurantId, menuItemId: $menuItemId) {
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

export const CLEAR_CART = gql`
  mutation ClearCart($restaurantId: ID!) {
    clearCart(restaurantId: $restaurantId)
  }
`;
