export const GET_HERO_SLIDES = `
query GetHeroSlides {
  metaobjects(type: "hero_section", first: 25) {
    edges {
      node {
        id
        fields {
          key
          value
          reference {
            __typename
            ... on MediaImage {
              image {
                url
              }
            }
            ... on Video {
              sources {
                url
                mimeType
              }
            }
          }
        }
      }
    }
  }
}
`;
