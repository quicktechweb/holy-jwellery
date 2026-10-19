export type CommentChannel = 'FACEBOOK_COMMENTS' | 'INSTAGRAM';
export type ReplyState = 'awaiting' | 'replied' | 'none';

export interface Post {
  id: string;
  channel: CommentChannel;
  title: string;
  createdAt: string; // ISO
}

export interface CommentReply {
  id: string;
  text: string;
  at: string; // ISO
}

export interface CommentItem {
  id: string;
  postId: string;
  channel: CommentChannel;
  author: string;
  text: string;
  createdAt: string; // ISO
  reply: ReplyState;
  unread: boolean;
  liked: boolean;
  hidden: boolean;
  deleted: boolean;
  filtered: boolean;
  replies: CommentReply[];
}

/** Backend connect korle ei duita API theke ashbe. Ekhon channel connect kora nai tai faka. */
export const initialPosts: Post[] = [];
export const initialComments: CommentItem[] = [];
