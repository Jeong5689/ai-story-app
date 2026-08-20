# 동화나라 오류 수정 보고서

## 발생 오류
1. Firebase 저장 실패: `Missing or insufficient permissions`
2. 단락별 삽화 생성 안 됨

---

## 오류 1 — Firebase 저장 권한 오류

### 원인
- Vercel 배포 환경에서 Firebase Auth 토큰이 만료되거나 전달되지 않음
- Firestore 보안 규칙과 실제 인증 상태 불일치

### 해결 방법

#### A. Firebase Firestore 규칙 수정
Firebase 콘솔 → `ai-story-app-199ff` → Firestore → 규칙 탭

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

> ⚠️ 개발 단계 임시 규칙입니다. 서비스 오픈 전 보안 규칙으로 변경 필요.

#### B. app/generate/page.tsx 수정
저장 실패 시 에러 메시지에 구체적인 내용 표시

```typescript
} catch (saveError: unknown) {
  const errMsg = saveError instanceof Error ? saveError.message : '알 수 없는 오류';
  console.error('저장 실패:', saveError);
  setSaveWarning(`동화는 생성됐지만 저장에 실패했습니다: ${errMsg}. 로그인 상태를 확인해주세요.`);
}
```

---

## 오류 2 — 단락별 삽화 생성 안 됨

### 원인
- `ParagraphWithImage` 컴포넌트가 결과 화면에 적용되지 않음
- `app/generate/page.tsx` 에서 기존 텍스트 렌더링 방식 그대로 사용 중

### 해결 방법

#### A. app/generate/page.tsx 수정
결과 화면에서 기존 텍스트 렌더링을 `ParagraphWithImage` 컴포넌트로 교체

```typescript
// 기존 코드 (교체 전)
<div className="prose max-w-none">
  {result.storyText.split('\n').map((line, index) => (
    <p key={index} className={`mb-3 ${
      line.startsWith('##')
        ? 'text-2xl font-bold text-purple-700'
        : 'text-gray-700 leading-relaxed text-lg'
    }`}>
      {line.replace('## ', '')}
    </p>
  ))}
</div>

// 수정 코드 (교체 후)
<div className="prose max-w-none">
  {result.storyText
    .split('\n')
    .filter(line => line.trim())
    .map((line, index) => (
      <ParagraphWithImage
        key={index}
        text={line}
        index={index}
        childName={childName}
        theme={theme}
      />
    ))}
</div>
```

#### B. import 추가
```typescript
import ParagraphWithImage from '../../components/ParagraphWithImage';
```

---

## 수정 파일 목록

| 파일 | 수정 내용 |
|------|----------|
| `app/generate/page.tsx` | ParagraphWithImage 컴포넌트 적용, 저장 오류 메시지 개선 |
| `components/ParagraphWithImage.tsx` | 신규 생성 — 단락별 삽화 생성 버튼 |
| `app/api/generate-image/route.ts` | 단락 내용 기반 이미지 생성 지원 |
| Firebase Firestore 규칙 | 임시 전체 허용으로 변경 |

---

## 배포 명령어

```bash
git add .
git commit -m "fix firebase permission and add paragraph image feature"
git push
```

---

## 주의사항

1. Firebase 규칙을 `allow read, write: if true` 로 변경하면 보안에 취약합니다.
2. 서비스 정식 오픈 전 아래 규칙으로 반드시 변경하세요:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

