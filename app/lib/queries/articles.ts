export const GET_ARTICLES = `
query GetArticles($first: Int!) {
  articles(first: $first, sortKey: PUBLISHED_AT, reverse: true) {
    edges {
      node {
        id
        handle
        title
        excerpt
        image {
          url
          altText
        }
        blog {
          handle
          title
        }
      }
    }
  }
}
`;
