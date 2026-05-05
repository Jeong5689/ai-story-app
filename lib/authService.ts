// 인증 서비스 — 회원가입, 로그인, 로그아웃
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    User,
  } from 'firebase/auth';
  import { auth } from './firebase';
  
  // 회원가입
  export async function signUp(
    email: string,
    password: string
  ): Promise<User> {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  }
  
  // 로그인
  export async function signIn(
    email: string,
    password: string
  ): Promise<User> {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  }
  
  // 로그아웃
  export async function logOut(): Promise<void> {
    await signOut(auth);
  }
  
  // 현재 로그인 상태 감지
  export function onAuthChanged(
    callback: (user: User | null) => void
  ) {
    return onAuthStateChanged(auth, callback);
  }