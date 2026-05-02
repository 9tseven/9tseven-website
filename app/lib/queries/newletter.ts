export const NEWSLETTER_SUBSCRIBE_MUTATION = `
  mutation CreateCustomer($input: CustomerInput!) {
    customerCreate(input: $input) {
      customer {
        id
        email
        emailMarketingConsent {
          marketingState
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export type NewsletterUserError = { field: string[] | null; message: string };

export type NewsletterSubscribeResponse = {
  data?: {
    customerCreate: {
      customer: {
        id: string;
        email: string;
        emailMarketingConsent: { marketingState: string } | null;
      } | null;
      userErrors: NewsletterUserError[];
    };
  };
};
