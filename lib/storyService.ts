// 동화 저장 및 불러오기 서비스
import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    orderBy,
    Timestamp,
  } from 'firebase/firestore';
  import { db } from './firebase';
  
  // 동화 데이터 타입 정의
  export interface Story {
    id?: string;
    userId: string;
    childName: string;
    theme: string;
    ageGroup: string;
    moral: string;
    storyText: string;
    imageUrl: string;
    createdAt: Timestamp;
  }
  
  // 동화 저장 함수
  export async function saveStory(
    storyData: Omit<Story, 'id' | 'createdAt'>
  ): Promise<string> {
    const docRef = await addDoc(collection(db, 'stories'), {
      ...storyData,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  }
  
  // 사용자별 동화 목록 조회 함수
  export async function getUserStories(
    userId: string
  ): Promise<Story[]> {
    const storiesQuery = query(
      collection(db, 'stories'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(storiesQuery);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Story));
  }