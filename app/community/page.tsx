'use client';
// 커뮤니티 메인 페이지 — 동화 공유 + 자유 게시판
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../components/AuthContext';
import { getPosts, toggleLike, deletePost, Post } from '../../lib/communityService';

export default function CommunityPage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'all' | 'story' | 'free'>('all');
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    setIsLoading(true);
    try {
      const allPosts = await getPosts();
      setPosts(allPosts);
    } catch (error) {
      console.error('게시글 불러오기 오류:', error);
    } finally {
      setIsLoading(false);
    }
  }

  // 탭에 따라 필터링
  const filteredPosts = posts.filter(post => {
    if (activeTab === 'all') return true;
    return post.type === activeTab;
  });

  // 좋아요 토글
  async function handleLike(postId: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    try {
      await toggleLike(postId, currentUser.uid);
      // 로컬 상태 업데이트
      setPosts(prev => prev.map(post => {
        if (post.id !== postId) return post;
        const alreadyLiked = post.likes.includes(currentUser.uid);
        return {
          ...post,
          likes: alreadyLiked
            ? post.likes.filter(id => id !== currentUser.uid)
            : [...post.likes, currentUser.uid],
          likeCount: alreadyLiked ? post.likeCount - 1 : post.likeCount + 1,
        };
      }));
      if (selectedPost?.id === postId) {
        const alreadyLiked = selectedPost.likes.includes(currentUser.uid);
        setSelectedPost(prev => prev ? {
          ...prev,
          likes: alreadyLiked
            ? prev.likes.filter(id => id !== currentUser.uid)
            : [...prev.likes, currentUser.uid],
          likeCount: alreadyLiked ? prev.likeCount - 1 : prev.likeCount + 1,
        } : null);
      }
    } catch (error) {
      console.error('좋아요 오류:', error);
    }
  }

  // 게시글 삭제
  async function handleDelete(postId: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      await deletePost(postId);
      setPosts(prev => prev.filter(p => p.id !== postId));
      if (selectedPost?.id === postId) setSelectedPost(null);
    } catch (error) {
      console.error('삭제 오류:', error);
    }
  }

  return (
    <main className="min-h-screen bg-linear-to-b from-purple-50 to-white">

      {/* 네비게이션 */}
      <nav className="flex justify-between items-center px-8 py-4 bg-white shadow-sm">
        <Link href="/">
          <div className="text-2xl font-bold text-purple-600 cursor-pointer">
            🌟 동화나라
          </div>
        </Link>
        <div className="flex gap-3">
          <Link href="/generate">
            <button className="border border-purple-600 text-purple-600 px-3 py-2 rounded-lg hover:bg-purple-50 transition text-sm">
              AI 동화
            </button>
          </Link>
          <Link href="/library">
            <button className="border border-gray-300 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-50 transition text-sm">
              내 동화함
            </button>
          </Link>
          {currentUser && (
            <Link href="/community/board">
              <button className="bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition text-sm">
                ✏️ 글쓰기
              </button>
            </Link>
          )}
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">

        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            💬 커뮤니티
          </h1>
          <p className="text-gray-400 text-sm">
            동화를 공유하고 이야기를 나눠보세요
          </p>
        </div>

        {/* 탭 */}
        <div className="flex gap-3 mb-6">
          {[
            { key: 'all', label: '전체', emoji: '📋' },
            { key: 'story', label: '동화 공유', emoji: '📖' },
            { key: 'free', label: '자유 게시판', emoji: '💭' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as 'all' | 'story' | 'free')}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition ${
                activeTab === tab.key
                  ? 'bg-purple-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-purple-400'
              }`}
            >
              {tab.emoji} {tab.label}
            </button>
          ))}
          <span className="ml-auto text-gray-400 text-sm self-center">
            총 {filteredPosts.length}개
          </span>
        </div>

        {/* 게시글 목록 / 상세 */}
        {selectedPost ? (

          /* 게시글 상세 보기 */
          <PostDetail
            post={selectedPost}
            currentUser={currentUser}
            onBack={() => setSelectedPost(null)}
            onLike={handleLike}
            onDelete={handleDelete}
          />

        ) : (

          /* 게시글 목록 */
          <div>
            {isLoading && (
              <div className="text-center py-20">
                <div className="text-5xl mb-4 animate-bounce">💬</div>
                <p className="text-gray-400">게시글을 불러오고 있어요...</p>
              </div>
            )}

            {!isLoading && filteredPosts.length === 0 && (
              <div className="text-center py-20 bg-white rounded-2xl">
                <div className="text-5xl mb-4">📭</div>
                <p className="text-gray-400 mb-4">아직 게시글이 없어요</p>
                {currentUser && (
                  <Link href="/community/board">
                    <button className="bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition text-sm">
                      첫 글 작성하기 ✏️
                    </button>
                  </Link>
                )}
              </div>
            )}

            <div className="space-y-4">
              {filteredPosts.map(post => (
                <div
                  key={post.id}
                  onClick={() => setSelectedPost(post)}
                  className="bg-white rounded-2xl shadow-sm p-5 cursor-pointer hover:shadow-md transition"
                >
                  <div className="flex items-start gap-4">
                    {/* 이미지 썸네일 */}
                    {post.imageUrl && (
                      <img
                        src={post.imageUrl}
                        alt="썸네일"
                        className="w-20 h-20 object-cover rounded-xl shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      {/* 타입 배지 */}
                      <span className={`inline-block text-xs px-2 py-1 rounded-full font-bold mb-2 ${
                        post.type === 'story'
                          ? 'bg-purple-100 text-purple-600'
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        {post.type === 'story' ? '📖 동화 공유' : '💭 자유'}
                      </span>
                      <h3 className="font-bold text-gray-800 text-lg mb-1 truncate">
                        {post.title}
                      </h3>
                      <p className="text-gray-500 text-sm line-clamp-2 mb-3">
                        {post.content}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span>{post.userEmail?.split('@')[0]}</span>
                        <span>{post.createdAt?.toDate?.()?.toLocaleDateString('ko-KR')}</span>
                        <button
                          onClick={(e) => handleLike(post.id!, e)}
                          className={`flex items-center gap-1 transition ${
                            currentUser && post.likes?.includes(currentUser.uid)
                              ? 'text-red-500 font-bold'
                              : 'text-gray-400 hover:text-red-400'
                          }`}
                        >
                          ❤️ {post.likeCount}
                        </button>
                        <span>💬 {post.commentCount}</span>
                        {currentUser?.uid === post.userId && (
                          <button
                            onClick={(e) => handleDelete(post.id!, e)}
                            className="text-red-400 hover:text-red-600 ml-auto"
                          >
                            삭제
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

// 게시글 상세 컴포넌트
function PostDetail({
  post,
  currentUser,
  onBack,
  onLike,
  onDelete,
}: {
  post: Post;
  currentUser: any;
  onBack: () => void;
  onLike: (postId: string, e: React.MouseEvent) => void;
  onDelete: (postId: string, e: React.MouseEvent) => void;
}) {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createComment, getComments, deleteComment } = require('../../lib/communityService');

  useEffect(() => {
    loadComments();
  }, [post.id]);

  async function loadComments() {
    try {
      const postComments = await getComments(post.id!);
      setComments(postComments);
    } catch (error) {
      console.error('댓글 불러오기 오류:', error);
    }
  }

  async function handleSubmitComment() {
    if (!currentUser || !newComment.trim()) return;
    setIsSubmitting(true);
    try {
      await createComment({
        postId: post.id!,
        userId: currentUser.uid,
        userEmail: currentUser.email,
        content: newComment.trim(),
      });
      setNewComment('');
      await loadComments();
    } catch (error) {
      console.error('댓글 작성 오류:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteComment(commentId: string) {
    if (!confirm('댓글을 삭제하시겠습니까?')) return;
    try {
      await deleteComment(commentId, post.id!);
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (error) {
      console.error('댓글 삭제 오류:', error);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-8">
      <button
        onClick={onBack}
        className="text-purple-600 mb-6 hover:underline text-sm"
      >
        ← 목록으로 돌아가기
      </button>

      {/* 타입 배지 */}
      <span className={`inline-block text-xs px-3 py-1 rounded-full font-bold mb-4 ${
        post.type === 'story'
          ? 'bg-purple-100 text-purple-600'
          : 'bg-blue-100 text-blue-600'
      }`}>
        {post.type === 'story' ? '📖 동화 공유' : '💭 자유 게시판'}
      </span>

      {/* 제목 */}
      <h2 className="text-2xl font-bold text-gray-800 mb-3">{post.title}</h2>

      {/* 작성자 정보 */}
      <div className="flex items-center gap-3 text-sm text-gray-400 mb-6 pb-4 border-b border-gray-100">
        <span>✍️ {post.userEmail?.split('@')[0]}</span>
        <span>{post.createdAt?.toDate?.()?.toLocaleDateString('ko-KR')}</span>
        {currentUser?.uid === post.userId && (
          <button
            onClick={(e) => onDelete(post.id!, e)}
            className="ml-auto text-red-400 hover:text-red-600 text-xs"
          >
            게시글 삭제
          </button>
        )}
      </div>

      {/* 이미지 */}
      {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt="게시글 이미지"
          className="w-full rounded-2xl mb-6 shadow-sm"
        />
      )}

      {/* 본문 */}
      <div className="text-gray-700 leading-relaxed text-base mb-6 whitespace-pre-line">
        {post.content}
      </div>

      {/* 좋아요 */}
      <div className="flex items-center gap-4 py-4 border-t border-b border-gray-100 mb-6">
        <button
          onClick={(e) => onLike(post.id!, e)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition font-bold ${
            currentUser && post.likes?.includes(currentUser.uid)
              ? 'bg-red-50 text-red-500'
              : 'bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-400'
          }`}
        >
          ❤️ 좋아요 {post.likeCount}
        </button>
        <span className="text-gray-400 text-sm">💬 댓글 {post.commentCount}</span>
      </div>

      {/* 댓글 목록 */}
      <div className="mb-6">
        <h3 className="font-bold text-gray-700 mb-4">
          댓글 {comments.length}개
        </h3>
        {comments.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-4">
            첫 댓글을 작성해보세요!
          </p>
        )}
        <div className="space-y-3">
          {comments.map(comment => (
            <div key={comment.id} className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-gray-700">
                  {comment.userEmail?.split('@')[0]}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">
                    {comment.createdAt?.toDate?.()?.toLocaleDateString('ko-KR')}
                  </span>
                  {currentUser?.uid === comment.userId && (
                    <button
                      onClick={() => handleDeleteComment(comment.id!)}
                      className="text-xs text-red-400 hover:text-red-600"
                    >
                      삭제
                    </button>
                  )}
                </div>
              </div>
              <p className="text-gray-600 text-sm">{comment.content}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 댓글 입력 */}
      {currentUser ? (
        <div className="flex gap-3">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment()}
            placeholder="댓글을 입력하세요..."
            className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-400"
          />
          <button
            onClick={handleSubmitComment}
            disabled={isSubmitting || !newComment.trim()}
            className="bg-purple-600 text-white px-5 py-3 rounded-xl hover:bg-purple-700 transition disabled:opacity-50 text-sm font-bold"
          >
            {isSubmitting ? '...' : '등록'}
          </button>
        </div>
      ) : (
        <div className="text-center py-4 bg-gray-50 rounded-xl">
          <p className="text-gray-400 text-sm mb-2">댓글을 작성하려면 로그인이 필요합니다</p>
          <Link href="/login">
            <button className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-purple-700 transition">
              로그인하기
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}