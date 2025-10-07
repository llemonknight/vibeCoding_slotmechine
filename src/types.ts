
export interface Quote {
  text: string;
  author: string;
  imageUrl?: string;
}

export interface QuoteResponse {
  randomQuotes: Quote[];
  finalQuote: Quote;
}