export interface QuoteComment {
  id:     string;
  author: string;
  text:   string;
  date:   Date;
}

export interface Quote {
  id?:         string;
  text:        string;
  author:      string;
  explanation: string;
  date:        Date;
  tags:        string[];
  likes:       number;
  category?:   string;
  expanded?:   boolean;
  // Moderation
  status?:     'approved' | 'pending';
}

/**
 * Coordonnées d'un visiteur qui propose une citation. Stockées à part
 * (collection `quoteSubmissions`, lisible par l'admin uniquement) pour qu'elles
 * ne soient jamais exposées avec la citation publique.
 */
export interface QuoteSubmission {
  id?:      string;
  quoteId:  string;
  email:    string;
  role?:    string;
  linkedin?: string;
}
