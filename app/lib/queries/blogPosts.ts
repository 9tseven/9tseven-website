export const GET_BLOG_POSTS = `
query GetBlogPosts {
  metaobjects(type: "blog_posts", first: 50) {
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
                altText
              }
            }
          }
        }
      }
    }
  }
}
`;
