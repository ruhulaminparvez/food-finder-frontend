import { gql } from '@apollo/client';

export const ADD_MENU_ITEM = gql`
  mutation AddMenuItem($input: CreateMenuInput!) {
    addMenuItem(input: $input) {
      id
      restaurantId
      name
      description
      price
      category
      image
      createdAt
    }
  }
`;

export const UPDATE_MENU_ITEM = gql`
  mutation UpdateMenuItem($id: ID!, $input: UpdateMenuInput!) {
    updateMenuItem(id: $id, input: $input) {
      id
      name
      description
      price
      category
      image
      updatedAt
    }
  }
`;

export const DELETE_MENU_ITEM = gql`
  mutation DeleteMenuItem($id: ID!) {
    deleteMenuItem(id: $id)
  }
`;
