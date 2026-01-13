import { gql } from '@apollo/client';

export const GET_ANALYTICS = gql`
  query GetAnalytics {
    getAnalytics {
      totalRestaurants
      totalUsers
      mostVisitedRestaurants {
        restaurant {
          id
          name
          cuisineType
          rating {
            average
            count
          }
          images
        }
        visitCount
        averageRating
        reviewCount
      }
      averageRatings
      crowdTrends {
        restaurant {
          id
          name
          cuisineType
        }
        crowdLevel
        currentVisitors
        lastUpdated
      }
    }
  }
`;
