'use client';
// 마이페이지 — 본인 정보 확인 및 수정
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../components/AuthContext';
import { getUserStories } from '../../lib/storyService';
import { getPosts } from '../../lib/communityService';
import { logOut } from '../../lib/authService';
import {
  updatePassword,
  updateProfile,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from 'firebase/auth';

export default function MyPage() {
  const { currentUser, isLoading } = useAuth();
  const router = useRouter();

  const [storyCount, setStoryCount] = useState(0);
  const [postCount, setPostCount] = useState(0);
  const [displayName, setDisplayName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && !currentUser) {
      router.push('/login');
      return;
    }
    if (currentUser) {
      setDisplayName(currentUser.displayName || '');
      loadStats();
    }
  }, [currentUser, isLoading]);

  async function loadStats() {
    try {
      const stories = await getUserStories(currentUser!.uid);
      setStoryCount(stories.length);
      const posts = await getPosts();
      const myPosts = posts.filter(p => p.userId === currentUser!.uid);
      setPostCount(myPosts.length);
    } catch (error) {
      console.error('통계 불러오기 오류:', error);
    }
  }

  // 닉네임 수정
  async function handleUpdateName() {
    if (!displayName.trim()) {
      setErrorMessage('닉네임을 입력해주세요');
      return;
    }
    setIsSaving(true);
    try {
      await updateProfile(currentUser!, { displayName: displayName.trim() });
      setSuccessMessage('닉네임이 변경되었습니다');
      setIsEditingName(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrorMessage('닉네임 변경에 실패했습니다');
    } finally {
      setIsSaving(false);
    }
  }

  // 비밀번호 변경
  async function handleUpdatePassword() {
    if (!currentPassword.trim()) {
      setErrorMessage('현재 비밀번호를 입력해주세요');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMessage('새 비밀번호는 6자 이상이어야 합니다');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('새 비밀번호가 일치하지 않습니다');
      return;
    }
    setIsSaving(true);
    setErrorMessage('');
    try {
      // 재인증
      const credential = EmailAuthProvider.credential(
        currentUser!.email!,
        currentPassword
      );
      await reauthenticateWithCredential(currentUser!, credential);
      await updatePassword(currentUser!, newPassword);
      setSuccessMessage('비밀번호가 변경되었습니다');
      setIsEditingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      if (error.code === 'auth/wrong-password') {
        setErrorMessage('현재 비밀번호가 올바르지 않습니다');
      } else {
        setErrorMessage('비밀번호 변경에 실패했습니다');
      }
    } finally {
      setIsSaving(false);
    }
  }

  // 회원 탈퇴
  async function handleDeleteAccount() {
    if (!deletePassword.trim()) {
      setErrorMessage('비밀번호를 입력해주세요');
      return;
    }
    setIsSaving(true);
    try {
      const credential = EmailAuthProvider.credential(
        currentUser!.email!,
        deletePassword
      );
      await reauthenticateWithCredential(currentUser!, credential);
      await deleteUser(currentUser!);
      router.push('/');
    } catch (error: any) {
      if (error.code === 'auth/wrong-password') {
        setErrorMessage('비밀번호가 올바르지 않습니다');
      } else {
        setErrorMessage('회원 탈퇴에 실패했습니다');
      }
    } finally {
      setIsSaving(false);
    }
  }

  // 로그아웃
  async function handleLogout() {
    await logOut();
    router.push('/');
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-5xl animate-bounce">⏳</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-50 to-white">

      {/* 네비게이션 */}
      <nav className="flex justify-between items-center px-8 py-4 bg-white shadow-sm">
        <Link href="/">
          <div className="text-2xl font-bold text-purple-600 cursor-pointer">
            🌟 동화나라
          </div>
        </Link>
        <div className="flex gap-3">
          <Link href="/library">
            <button className="border border-purple-600 text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-50 transition text-sm">
              내 동화함
            </button>
          </Link>
          <button
            onClick={handleLogout}
            className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 transition text-sm"
          >
            로그아웃
          </button>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-12">

        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          👤 마이페이지
        </h1>

        {/* 성공/오류 메시지 */}
        {successMessage && (
          <div className="bg-green-50 text-green-600 rounded-xl px-4 py-3 mb-4 text-sm text-center">
            ✓ {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 mb-4 text-sm text-center">
            {errorMessage}
          </div>
        )}

        <div className="space-y-4">

          {/* 프로필 카드 */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-3xl">
                👤
              </div>
              <div>
                <p className="font-bold text-gray-800 text-lg">
                  {currentUser?.displayName || '닉네임 없음'}
                </p>
                <p className="text-gray-400 text-sm">{currentUser?.email}</p>
                <p className="text-gray-300 text-xs mt-1">
                  가입일: {currentUser?.metadata?.creationTime
                    ? new Date(currentUser.metadata.creationTime).toLocaleDateString('ko-KR')
                    : '알 수 없음'}
                </p>
              </div>
            </div>

            {/* 통계 */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{storyCount}</p>
                <p className="text-gray-400 text-sm">내 동화</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-500">{postCount}</p>
                <p className="text-gray-400 text-sm">커뮤니티 게시글</p>
              </div>
            </div>
          </div>

          {/* 닉네임 수정 */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">닉네임 수정</h2>
              <button
                onClick={() => {
                  setIsEditingName(!isEditingName);
                  setErrorMessage('');
                }}
                className="text-purple-600 text-sm hover:underline"
              >
                {isEditingName ? '취소' : '수정'}
              </button>
            </div>
            {isEditingName ? (
              <div className="flex gap-3">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="새 닉네임 입력"
                  maxLength={20}
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-400"
                />
                <button
                  onClick={handleUpdateName}
                  disabled={isSaving}
                  className="bg-purple-600 text-white px-5 py-3 rounded-xl hover:bg-purple-700 transition disabled:opacity-50 text-sm font-bold"
                >
                  저장
                </button>
              </div>
            ) : (
              <p className="text-gray-500">
                {currentUser?.displayName || '닉네임을 설정해주세요'}
              </p>
            )}
          </div>

          {/* 비밀번호 변경 */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">비밀번호 변경</h2>
              <button
                onClick={() => {
                  setIsEditingPassword(!isEditingPassword);
                  setErrorMessage('');
                }}
                className="text-purple-600 text-sm hover:underline"
              >
                {isEditingPassword ? '취소' : '변경'}
              </button>
            </div>
            {isEditingPassword ? (
              <div className="space-y-3">
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="현재 비밀번호"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-400"
                />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="새 비밀번호 (6자 이상)"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-400"
                />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="새 비밀번호 확인"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-400"
                />
                <button
                  onClick={handleUpdatePassword}
                  disabled={isSaving}
                  className="w-full bg-purple-600 text-white py-3 rounded-xl hover:bg-purple-700 transition disabled:opacity-50 font-bold"
                >
                  {isSaving ? '변경 중...' : '비밀번호 변경'}
                </button>
              </div>
            ) : (
              <p className="text-gray-400 text-sm">••••••••</p>
            )}
          </div>

          {/* 빠른 메뉴 */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">빠른 메뉴</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/library">
                <button className="w-full border border-purple-200 text-purple-600 py-3 rounded-xl hover:bg-purple-50 transition text-sm font-bold">
                  📚 내 동화함
                </button>
              </Link>
              <Link href="/generate">
                <button className="w-full border border-purple-200 text-purple-600 py-3 rounded-xl hover:bg-purple-50 transition text-sm font-bold">
                  ✨ 동화 만들기
                </button>
              </Link>
              <Link href="/community">
                <button className="w-full border border-blue-200 text-blue-600 py-3 rounded-xl hover:bg-blue-50 transition text-sm font-bold">
                  💬 커뮤니티
                </button>
              </Link>
              <Link href="/publish">
                <button className="w-full border border-green-200 text-green-600 py-3 rounded-xl hover:bg-green-50 transition text-sm font-bold">
                  📖 출판하기
                </button>
              </Link>
            </div>
          </div>

          {/* 회원 탈퇴 */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-gray-800">회원 탈퇴</h2>
              <button
                onClick={() => {
                  setIsDeleting(!isDeleting);
                  setErrorMessage('');
                }}
                className="text-red-400 text-sm hover:underline"
              >
                {isDeleting ? '취소' : '탈퇴'}
              </button>
            </div>
            {isDeleting ? (
              <div className="space-y-3">
                <div className="bg-red-50 rounded-xl p-3 text-xs text-red-600">
                  ⚠️ 탈퇴 시 모든 데이터(동화, 게시글)가 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
                </div>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="비밀번호 입력"
                  className="w-full border border-red-200 rounded-xl px-4 py-3 focus:outline-none focus:border-red-400"
                />
                <button
                  onClick={handleDeleteAccount}
                  disabled={isSaving}
                  className="w-full bg-red-500 text-white py-3 rounded-xl hover:bg-red-600 transition disabled:opacity-50 font-bold"
                >
                  {isSaving ? '처리 중...' : '회원 탈퇴 확인'}
                </button>
              </div>
            ) : (
              <p className="text-gray-400 text-sm">탈퇴 시 모든 데이터가 삭제됩니다</p>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}