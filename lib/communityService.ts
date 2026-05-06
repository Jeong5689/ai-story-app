// 커뮤니티 게시판 서비스 — 게시글, 좋아요, 댓글
import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    increment,
    Timestamp,
    arrayUnion,
    arrayRemove,
  } from 'firebase/firestore';
  import { db } from './firebase';
  
  // 게시글 타입
  export interface Post {
    id?: string;
    userId: string;
    userEmail: string;
    type: 'story' | 'free'; // 동화공유 or 자유게시판
    title: string;
    content: string;
    imageUrl?: string;
    storyId?: string; // 동화 공유일 때 원본 동화 ID
    likes: string[]; // 좋아요 누른 userId 배열
    likeCount: number;
    commentCount: number;
    createdAt: Timestamp;
  }
  
  // 댓글 타입
  export interface Comment {
    id?: string;
    postId: string;
    userId: string;
    userEmail: string;
    content: string;
    createdAt: Timestamp;
  }
  
  // 게시글 작성
  export async function createPost(
    postData: Omit<Post, 'id' | 'createdAt' | 'likes' | 'likeCount' | 'commentCount'>
  ): Promise<string> {
    const docRef = await addDoc(collection(db, 'posts'), {
      ...postData,
      likes: [],
      likeCount: 0,
      commentCount: 0,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  }
  
  // 게시글 전체 조회
  export async function getPosts(type?: 'story' | 'free'): Promise<Post[]> {
    const postsQuery = query(
      collection(db, 'posts'),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(postsQuery);
    const posts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Post));
  
    if (type) return posts.filter(p => p.type === type);
    return posts;
  }
  
  // 게시글 단건 조회
  export async function getPost(postId: string): Promise<Post | null> {
    const docRef = doc(db, 'posts', postId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    return { id: docSnap.id, ...docSnap.data() } as Post;
  }
  
  // 게시글 삭제
  export async function deletePost(postId: string): Promise<void> {
    await deleteDoc(doc(db, 'posts', postId));
  }
  
  // 좋아요 토글
  export async function toggleLike(
    postId: string,
    userId: string
  ): Promise<void> {
    const postRef = doc(db, 'posts', postId);
    const postSnap = await getDoc(postRef);
    if (!postSnap.exists()) return;
  
    const likes: string[] = postSnap.data().likes || [];
    const alreadyLiked = likes.includes(userId);
  
    await updateDoc(postRef, {
      likes: alreadyLiked ? arrayRemove(userId) : arrayUnion(userId),
      likeCount: increment(alreadyLiked ? -1 : 1),
    });
  }
  
  // 댓글 작성
  export async function createComment(
    commentData: Omit<Comment, 'id' | 'createdAt'>
  ): Promise<void> {
    await addDoc(collection(db, 'comments'), {
      ...commentData,
      createdAt: Timestamp.now(),
    });
    // 게시글 댓글 수 증가
    await updateDoc(doc(db, 'posts', commentData.postId), {
      commentCount: increment(1),
    });
  }
  
  // 댓글 조회
  export async function getComments(postId: string): Promise<Comment[]> {
    const commentsQuery = query(
      collection(db, 'comments'),
      orderBy('createdAt', 'asc')
    );
    const snapshot = await getDocs(commentsQuery);
    return snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as Comment))
      .filter(c => c.postId === postId);
  }
  
  // 댓글 삭제
  export async function deleteComment(
    commentId: string,
    postId: string
  ): Promise<void> {
    await deleteDoc(doc(db, 'comments', commentId));
    await updateDoc(doc(db, 'posts', postId), {
      commentCount: increment(-1),
    });
  }