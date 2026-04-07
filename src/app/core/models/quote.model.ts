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
  status?:             'approved' | 'pending';
  submitterEmail?:     string;
  submitterRole?:      string;
  submitterLinkedin?:  string;
}
