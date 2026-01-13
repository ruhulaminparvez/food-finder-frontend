import { gql } from '@apollo/client';

export const LOGIN_USER = gql`
  mutation LoginUser($input: LoginInput!) {
    loginUser(input: $input) {
      token
      user {
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
  }
`;

export const REGISTER_USER = gql`
  mutation RegisterUser($input: RegisterInput!) {
    registerUser(input: $input) {
      token
      user {
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
  }
`;
