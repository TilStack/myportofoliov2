export interface BlogPost {
  id?:         string;
  title:       string;
  slug:        string;
  excerpt:     string;
  content:     string;
  coverUrl:    string;
  tags:        string[];
  likes:       number;
  published:   boolean;
  authorId:    string;
  createdAt:   Date;
  updatedAt:   Date;
}

export interface BlogComment {
  id?:       string;
  postId:    string;
  content:   string;
  authorId:  string;
  authorName:string;
  createdAt: Date;
}
