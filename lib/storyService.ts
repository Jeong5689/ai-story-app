// 동화 저장 및 불러오기 서비스
import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    updateDoc,
    doc,
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
    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    } as Story));
  }

  // 동화 삭제 함수
  export async function deleteStory(storyId: string): Promise<void> {
    await deleteDoc(doc(db, 'stories', storyId));
  }

  // 동화 일부 필드 수정 (제목·본문·삽화 URL 등)
  export async function updateStory(
    storyId: string,
    updates: Partial<Pick<Story, 'childName' | 'storyText' | 'imageUrl'>>
  ): Promise<void> {
    await updateDoc(doc(db, 'stories', storyId), updates);
  }