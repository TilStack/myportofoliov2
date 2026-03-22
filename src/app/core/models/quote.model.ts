export interface Quote {
  id?:         string;
  text:        string;
  author:      string;
  explanation: string;
  date:        Date;
  tags:        string[];
  likes:       number;
  category?:   string;
  expanded?:   boolean; // UI state only — not persisted
}
