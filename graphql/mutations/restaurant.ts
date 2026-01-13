import { gql } from '@apollo/client';

export const CREATE_RESTAURANT = gql`
  mutation CreateRestaurant($input: CreateRestaurantInput!) {
    createRestaurant(input: $input) {
      id
      name
      description
      cuisineType
      location {
        lat
        lng
      }
      address
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

export const UPDATE_RESTAURANT = gql`
  mutation UpdateRestaurant($id: ID!, $input: UpdateRestaurantInput!) {
    updateRestaurant(id: $id, input: $input) {
      id
      name
      description
      cuisineType
      location {
        lat
        lng
      }
      address
      openingHours {
        day
        open
        close
        isClosed
      }
      images
      crowdLevel
      updatedAt
    }
  }
`;

export const DELETE_RESTAURANT = gql`
  mutation DeleteRestaurant($id: ID!) {
    deleteRestaurant(id: $id)
  }
`;
