import { gql } from '@apollo/client';

export const UPDATE_CROWD_DATA = gql`
  mutation UpdateCrowdData($input: UpdateCrowdDataInput!) {
    updateCrowdData(input: $input) {
      id
      restaurantId
      currentVisitors
      crowdLevel
      lastUpdated
    }
  }
`;
