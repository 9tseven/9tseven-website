const PRODUCT_FIELDS = `
  id
  handle
  title
  descriptionHtml
  productType
  tags
  createdAt
  priceRange {
    minVariantPrice {
      amount
      currencyCode
    }
  }
  options {
    name
    values
  }
  featuredImage {
    url
    altText
  }
  images(first: 5) {
    edges {
      node {
        url
        altText
      }
    }
  }
  variants(first: 50) {
    edges {
      node {
        id
        availableForSale
        price {
          amount
        }
        compareAtPrice {
          amount
        }
        selectedOptions {
          name
          value
        }
      }
    }
  }
`;

export const GET_PRODUCTS = `
query GetProducts($first: Int!, $query: String) {
  products(first: $first, query: $query) {
    edges {
      node {
        ${PRODUCT_FIELDS}
      }
    }
  }
}
`;

export const GET_PRODUCT_BY_HANDLE = `
query GetProductByHandle($handle: String!) {
  product(handle: $handle) {
    ${PRODUCT_FIELDS}
    material: metafield(namespace: "custom", key: "custom_material_description") { value }
    sizing: metafield(namespace: "custom", key: "custom_size_description") { value }
  }
}
`;
