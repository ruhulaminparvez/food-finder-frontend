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
      totalOrders
      ordersByStatus {
        pending
        confirmed
        preparing
        ready
        completed
        cancelled
      }
      totalRevenue
      ordersByDate {
        date
        count
        revenue
      }
      recentOrders {
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
            price
          }
          quantity
          price
          name
        }
        totalAmount
        status
        deliveryAddress
        createdAt
        updatedAt
      }
    }
  }
`;
