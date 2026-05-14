export const GET_COMMUNITY_IMAGES = `
query GetCommunityImages {
  metaobjects(type: "community_ig_section", first: 20) {
    edges {
      node {
        id
        fields {
          key
          reference {
            __typename
            ... on MediaImage {
              image {
                url(transform: { maxWidth: 800, maxHeight: 800, crop: CENTER })
                altText
                width
                height
              }
            }
          }
        }
      }
    }
  }
}
`;
