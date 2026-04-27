export const GET_NAV_PREVIEWS = `
query GetNavPreviews($previewCount: Int!) {
  newArrivals: products(
    first: $previewCount
    sortKey: CREATED_AT
    reverse: true
    query: "tag:'new-arrival'"
  ) {
    edges {
      node {
        handle
        title
        productType
        featuredImage {
          url
          altText
        }
      }
    }
  }
  allProducts: products(first: $previewCount) {
    edges {
      node {
        handle
        title
        productType
        featuredImage {
          url
          altText
        }
      }
    }
  }
}
`;
