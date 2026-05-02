export const GET_POLICIES = `
query GetPolicies {
  metaobjects(type: "policy", first: 25) {
    edges {
      node {
        fields {
          key
          value
        }
      }
    }
  }
}
`;
