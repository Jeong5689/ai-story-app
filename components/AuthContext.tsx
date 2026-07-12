'use client';
// 로그인 상태를 앱 전체에서 공유하는 Context
import { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { onAuthChanged, ensureAuth } from '../lib/authService';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  isLoading: true,
});

// 앱 전체를 감싸는 Provider
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let initialLoad = true;

    // Firebase 로그인 상태 변화 감지
    const unsubscribe = onAuthChanged((user) => {
      setCurrentUser(user);

      if (initialLoad) {
        initialLoad = false;
        if (!user) {
          ensureAuth().catch((error) => {
            console.error('익명 인증 초기화 오류:', error);
            setIsLoading(false);
          });
        } else {
          setIsLoading(false);
        }
      }
    });

    // 컴포넌트 언마운트 시 구독 해제
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

// 다른 컴포넌트에서 쉽게 사용하는 훅
export function useAuth() {
  return useContext(AuthContext);
}