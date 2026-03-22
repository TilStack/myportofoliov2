import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { BlogService } from '../../core/services/blog.service';
import { FirebaseService } from '../../core/services/firebase.service';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { FadeOnScrollDirective } from '../../shared/directives/fade-on-scroll.directive';
import { BlogPost } from '../../core/models';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule,
            SkeletonComponent, ButtonComponent, FadeOnScrollDirective],
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.scss',
})
export class BlogComponent implements OnInit {
  blogService = inject(BlogService);
  fbService   = inject(FirebaseService);
  fb          = inject(FormBuilder);

  posts       = signal<BlogPost[]>([]);
  loading     = signal(true);
  likedPosts  = signal<Set<string>>(new Set());
  subscribed  = signal(false);
  subscribing = signal(false);

  newsletterForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  get isLoggedIn(): boolean { return !!this.fbService.currentUser; }

  ngOnInit(): void {
    this.blogService.getPosts().subscribe({
      next: p => {
        this.posts.set(p.filter(post => post.published));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  likePost(post: BlogPost, event: Event): void {
    event.stopPropagation();
    if (!this.isLoggedIn) return;
    if (!post.id) return;

    const liked = new Set(this.likedPosts());
    if (liked.has(post.id)) return;
    liked.add(post.id);
    this.likedPosts.set(liked);

    this.blogService.likePost(post.id, post.likes);
    post.likes++;
  }

  subscribeNewsletter(): void {
    if (this.newsletterForm.invalid) return;
    this.subscribing.set(true);
    // Simulated async — wire to your email provider
    setTimeout(() => {
      this.subscribed.set(true);
      this.subscribing.set(false);
    }, 1200);
  }
}
