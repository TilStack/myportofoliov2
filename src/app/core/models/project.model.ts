export interface Project {
  id?:         string;
  title:       string;
  description: string;
  shortDesc:   string;
  imageUrl:    string;
  images:      string[];
  videoUrl?:   string;
  techStack:   string[];
  githubUrl?:  string;
  liveUrl?:    string;
  featured:    boolean;
  order:       number;
  createdAt:   Date;
}
