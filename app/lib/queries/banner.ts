export const GET_BANNER = `
query GetNewsletterPopup {
  metaobjects(type: "newsletter_popup", first: 1) {
    edges {
      node {
        fields {
          key
          value
          reference {
            __typename
            ... on MediaImage {
              image {
                url
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
