export type Disciple = {
  name: string;
  churchTitle?: string;
  image?: string;
  quote?: string;
  rank?: string;
  description?: string;
};
// Add only friends and details supplied/approved by the user. Leave empty until then.
// Example shape: { name, churchTitle, image, quote, rank, description }
export const disciples: Disciple[] = [];
