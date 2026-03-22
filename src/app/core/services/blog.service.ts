import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { FirebaseService } from './firebase.service';
import { BlogPost, BlogComment } from '../models';

const POSTS    = 'blogPosts';
const COMMENTS = 'comments';

@Injectable({ providedIn: 'root' })
export class BlogService {
  private fb = inject(FirebaseService);

  getPosts(): Observable<BlogPost[]> {
    return this.fb.getAll<BlogPost>(POSTS);
  }

  getPost(id: string): Observable<BlogPost | null> {
    return this.fb.getById<BlogPost>(POSTS, id);
  }

  getComments(postId: string): Observable<BlogComment[]> {
    // Comments are sub-keyed by postId via a shared comments collection
    return this.fb.getAll<BlogComment>(`${POSTS}/${postId}/comments`);
  }

  addComment(postId: string, comment: Omit<BlogComment, 'id'>): Promise<string> {
    return this.fb.add(`${POSTS}/${postId}/comments`, comment);
  }

  likePost(postId: string, currentLikes: number): Promise<void> {
    return this.fb.update<BlogPost>(POSTS, postId, { likes: currentLikes + 1 });
  }

  create(post: Omit<BlogPost, 'id'>): Promise<string> {
    return this.fb.add(POSTS, post);
  }
}
