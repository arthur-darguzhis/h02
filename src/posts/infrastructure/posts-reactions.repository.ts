import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { PostReaction } from '../application/entities/post-reaction';
import { LikeStatus } from '../../common/pgTypes/enum/likeStatus';

@Injectable()
export class PostsReactionsRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(PostReaction)
    private postsReactionsRepository: Repository<PostReaction>,
  ) {}

  async findUserReaction(postId: string, userId: string) {
    return await this.postsReactionsRepository.findOneBy({ postId, userId });
  }

  async calculateCountOfLikes(postId: string) {
    return await this.postsReactionsRepository.countBy({
      postId: postId,
      status: LikeStatus.Like,
      isBanned: false,
    });
  }

  async calculateCountOfDislikes(postId: string) {
    return await this.postsReactionsRepository.countBy({
      postId: postId,
      status: LikeStatus.Dislike,
      isBanned: false,
    });
  }

  async getNewestLikesOnThePost(postId: string) {
    return await this.dataSource.query(
      `SELECT p.created_at as "addedAt", 
                p.user_id as "userId",  
                u.login as "login"
              FROM post_reactions as p
                LEFT JOIN users u on p.user_id = u.id 
              WHERE post_id = $1 AND status = 'Like'
              ORDER BY p.created_at DESC 
              LIMIT 3`,
      [postId],
    );
  }

  async save(userReaction: PostReaction) {
    return await this.postsReactionsRepository.save(userReaction);
  }

  async setBanStatusByUserId(userId: string, isBanned: boolean) {
    await this.postsReactionsRepository
      .createQueryBuilder()
      .update(PostReaction)
      .set({ isBanned })
      .where('user_id = :userId', { userId: userId })
      .execute();
  }
}
