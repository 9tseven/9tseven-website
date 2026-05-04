export const GET_BANNER = `
query GetBanner {
  metaobjects(type: "banner", first: 1) {
    edges {
      node {
        id
        fields {
          key
          value
        }
      }
    }
  }
}
`;
