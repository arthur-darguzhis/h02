import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '../../common/exceptions/domain.exceptions/entity-not-found.exception';
import { Post } from '../application/entities/post';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
  ) {}

  async saveNewPost(post) {
    const query = `
    INSERT INTO posts (title,
                       short_description,
                       content,
                       blog_id,
                       user_id,
                       is_banned,
                       created_at,
                       likes_count,
                       dislikes_count,
                       newest_likes
    )
    VALUES ( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb[])
    RETURNING id
  `;

    const result = await this.dataSource.query(query, [
      post.title,
      post.shortDescription,
      post.content,
      post.blogId,
      post.userId,
      post.isBanned,
      post.createdAt,
      post.likesCount,
      post.dislikesCount,
      post.newestLikes,
    ]);

    return result[0].id;
  }

  async findByTitleAndBlog(title: string, blogId: string) {
    const post = await this.dataSource.query(
      `SELECT id,
         title,
         short_description as "shortDescription",
         content,
         blog_id as "blogId",
         user_id as "userId",
         is_banned as "isBanned",
         created_at as "createdAt",
         likes_count as "likesCount",
         dislikes_count as "dislikesCount",
         newest_likes as "newestLikes" 
        FROM posts WHERE title = $1 AND blog_id = $2`,
      [title, blogId],
    );

    return post[0] || null;
  }

  async findById(postId: string) {
    const post = await this.dataSource.query(
      `SELECT id,
         title,
         short_description as "shortDescription",
         content,
         blog_id as "blogId",
         user_id as "userId",
         is_banned as "isBanned",
         created_at as "createdAt",
         likes_count as "likesCount",
         dislikes_count as "dislikesCount",
         newest_likes as "newestLikes" 
        FROM posts WHERE id = $1`,
      [postId],
    );

    return post[0] || null;
  }

  async getById(postId: string) {
    const post = await this.findById(postId);
    if (!post) {
      throw new EntityNotFoundException(`Post with id: ${postId} is not found`);
    }

    return post;
  }

  async delete(postId: string) {
    await this.dataSource.query(`DELETE FROM posts WHERE id = $1`, [postId]);
  }

  async update(post: any) {
    await this.dataSource.query(
      `UPDATE posts SET title = $1, short_description = $2, content = $3 WHERE id = $4`,
      [post.title, post.shortDescription, post.content, post.id],
    );
  }

  async throwIfNotExists(postId: string) {
    const post = await this.findById(postId);
    if (!post) {
      throw new EntityNotFoundException(`Post with id: ${postId} is not found`);
    }
  }

  async updateLikesInfo(
    postId: string,
    likesCount: number,
    dislikesCount: number,
    newestLikes: any,
  ) {
    await this.dataSource.query(
      `UPDATE posts SET likes_count = $1, dislikes_count = $2, newest_likes = $3::jsonb[] WHERE id = $4`,
      [likesCount, dislikesCount, newestLikes, postId],
    );
  }

  async setBanStatusByBlogId(blogId: string, isBanned: boolean) {
    const banDate = isBanned ? new Date() : null;
    await this.dataSource.query(
      `UPDATE blogs SET is_banned = $1, ban_date = $2 WHERE id = $3`,
      [isBanned, banDate, blogId],
    );

    await this.dataSource.query(
      `UPDATE posts SET is_banned = $1 WHERE blog_id = $2`,
      [isBanned, blogId],
    );
  }

  async setBanStatusByUserId(userId: string, isBanned: boolean) {
    await this.dataSource.query(
      `UPDATE posts SET is_banned = $1 WHERE user_id = $2`,
      [isBanned, userId],
    );
  }

  async recalculatePostReactionsAfterUserBan(userId: string) {
    await this.dataSource.query(
      `UPDATE posts SET likes_count = (SELECT COUNT(*) FROM post_reactions as pr WHERE pr.post_id = posts.id AND pr.status = 'Like' AND pr.is_banned = false),
                 dislikes_count = (SELECT COUNT(*) FROM post_reactions as pr WHERE pr.post_id = posts.id AND pr.status = 'Dislike' AND pr.is_banned = false),
                 newest_likes = (SELECT ARRAY(SELECT 
                                          json_build_object(
                                            'addedAt', pr.created_at,
                                            'userId', pr.user_id,
                                            'login', u.login
                                          )
                                 FROM post_reactions as pr
                                        JOIN users u on pr.user_id = u.id
                                 WHERE post_id = posts.id AND pr.status = 'Like' AND pr.is_banned = false
                                 ORDER BY pr.created_at DESC
                                 LIMIT 3) as likesInfo)
             WHERE id IN (SELECT post_id FROM post_reactions WHERE post_reactions.user_id = $1)`,
      [userId],
    );
  }
}
