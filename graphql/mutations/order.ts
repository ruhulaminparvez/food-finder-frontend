import { gql } from '@apollo/client';

export const CREATE_ORDER = gql`
  mutation CreateOrder($input: CreateOrderInput!) {
    createOrder(input: $input) {
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

export const UPDATE_ORDER_STATUS = gql`
  mutation UpdateOrderStatus($orderId: ID!, $status: OrderStatus!) {
    updateOrderStatus(orderId: $orderId, status: $status) {
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

export const CANCEL_ORDER = gql`
  mutation CancelOrder($orderId: ID!) {
    cancelOrder(orderId: $orderId) {
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
