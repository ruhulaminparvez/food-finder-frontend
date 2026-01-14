import { gql } from '@apollo/client';

export const GET_ORDER_BY_ID = gql`
  query GetOrderById($orderId: ID!) {
    getOrderById(orderId: $orderId) {
      id
      userId
      user {
        id
        name
        email
      }
      restaurantId
      restaurant {
        id
        name
        address
        cuisineType
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
      status
      deliveryAddress
      deliveryLocation {
        lat
        lng
      }
      specialInstructions
      createdAt
      updatedAt
    }
  }
`;

export const GET_USER_ORDERS = gql`
  query GetUserOrders($limit: Int, $offset: Int) {
    getUserOrders(limit: $limit, offset: $offset) {
      id
      userId
      restaurantId
      restaurant {
        id
        name
        address
        cuisineType
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
      status
      deliveryAddress
      deliveryLocation {
        lat
        lng
      }
      specialInstructions
      createdAt
      updatedAt
    }
  }
`;

export const GET_RESTAURANT_ORDERS = gql`
  query GetRestaurantOrders($restaurantId: ID!, $status: OrderStatus, $limit: Int, $offset: Int) {
    getRestaurantOrders(restaurantId: $restaurantId, status: $status, limit: $limit, offset: $offset) {
      id
      userId
      user {
        id
        name
        email
      }
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
      status
      deliveryAddress
      deliveryLocation {
        lat
        lng
      }
      specialInstructions
      createdAt
      updatedAt
    }
  }
`;
