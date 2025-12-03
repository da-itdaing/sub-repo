# 프론트엔드 개발자 가이드

DA-ITDAING 프로젝트 프론트엔드 개발을 위한 가이드입니다.

## 🚀 시작하기

### 1. 환경 확인

```bash
# Node.js 버전 확인 (20.x 권장)
node --version

# NPM 확인
npm --version

# 프로젝트 디렉토리로 이동
cd ~/itdaing-web
```

### 2. 프로젝트 구조

```
~/itdaing-web/                     # 프론트엔드 디렉토리
├── src/
│   ├── pages/                    # 페이지 컴포넌트
│   │   ├── consumer/             # 소비자 페이지
│   │   ├── seller/               # 판매자 페이지
│   │   └── admin/                # 관리자 페이지
│   ├── components/               # 재사용 컴포넌트
│   │   ├── ui/                   # Radix UI 컴포넌트
│   │   ├── layout/               # 레이아웃
│   │   ├── map/                  # Kakao Map
│   │   └── custom-ui/            # 커스텀 UI
│   ├── services/                 # API 서비스
│   ├── hooks/                    # Custom Hooks
│   ├── context/                  # Context API
│   └── utils/                    # 유틸리티
├── public/                       # 정적 파일
├── package.json                  # NPM 패키지
├── vite.config.js               # Vite 설정
└── tailwind.config.js           # Tailwind CSS 설정
```

---

## 🌿 Git 워크플로우

### 초기 설정 (한 번만)

```bash
# 1. Git 사용자 설정
git config --global user.name "본인이름"
git config --global user.email "본인이메일@example.com"

# 2. Credential helper 설정
git config --global credential.helper store

# 3. GitHub Personal Access Token (PAT) 생성
# https://github.com/settings/tokens/new
# - Note: "Private EC2 - 본인이름"
# - Expiration: 90 days
# - Scopes: repo, workflow
# - Generate token 클릭 후 복사

# 4. 첫 push 시 인증
cd ~/itdaing-web
git push origin dev/fe
# Username: 본인GitHub아이디
# Password: 생성한PAT토큰
```

### 일상적인 작업 흐름

```bash
# 1. 최신 변경사항 받기
cd ~/itdaing-web
git checkout dev/fe
git pull origin dev/fe

# 2. 개발 작업
# ... 코드 작성 ...

# 3. 개발 서버로 확인
npm run dev

# 4. 변경사항 확인
git status
git diff

# 5. 커밋 (Gitmoji 사용 권장)
git add .
git commit -m "💄 :lipstick: 메인 페이지 UI 개선

- 히어로 섹션 레이아웃 개선
- 반응형 디자인 적용
- Tailwind CSS 스타일링"

# 6. Push
git push origin dev/fe

# 7. (선택) GitHub에서 Pull Request 생성
# dev/fe → main
```

---

## 🔧 개발 환경

### 프론트엔드 개발 서버 실행

```bash
cd ~/itdaing-web

# 의존성 설치 (최초 1회 또는 package.json 변경 시)
npm install

# 개발 서버 시작
npm run dev -- --host 0.0.0.0 --port 3000

# 브라우저에서 접속
# http://[본인IP]:3000
```

### 프로덕션 빌드

```bash
# 빌드
npm run build

# 빌드 결과 확인
ls -lh dist/

# 빌드 미리보기
npm run preview
```

---

## 🎨 스타일링

### Tailwind CSS 사용

```jsx
// ✅ Tailwind 유틸리티 클래스 사용
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
  <h1 className="text-2xl font-bold text-gray-900">제목</h1>
</div>

// ❌ 인라인 스타일 지양
<div style={{display: 'flex', padding: '16px'}}>
```

### Radix UI 컴포넌트

```jsx
import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"

// 미리 만들어진 UI 컴포넌트 활용
<Button variant="default" size="lg">클릭</Button>
```

---

## 🔌 API 연동

### API 클라이언트 사용

```jsx
import { authService } from '@/services/authService';
import { popupService } from '@/services/popupService';

// 로그인
const handleLogin = async () => {
  try {
    const response = await authService.login({ loginId, password });
    if (response.success) {
      // 성공 처리
    }
  } catch (error) {
    // 에러 처리
  }
};

// 팝업 목록 조회
const fetchPopups = async () => {
  const response = await popupService.getPopups();
  setPopups(response.data);
};
```

### 인증 토큰 관리

```jsx
import { getAccessToken, setAccessToken } from '@/utils/tokenStorage';

// 토큰 자동 포함 (client.js에서 처리됨)
// Authorization: Bearer {token}
```

---

## 🗺️ Kakao Map 사용

### 기본 사용법

```jsx
import KakaoMap from '@/components/map/KakaoMap';

<KakaoMap
  center={{ lat: 35.1595, lng: 126.8526 }}
  level={3}
  markers={[
    { lat: 35.1595, lng: 126.8526, title: "팝업스토어" }
  ]}
/>
```

### Drawing Manager

```jsx
import { useDrawingManager } from '@/hooks/useDrawingManager';

const { startDrawing, getPolygon } = useDrawingManager(mapRef);

// 다각형 그리기 시작
startDrawing();

// 그린 다각형 데이터 가져오기
const polygon = getPolygon();
```

---

## 📝 컴포넌트 작성 가이드

### 페이지 컴포넌트

```jsx
// src/pages/consumer/MyNewPage.jsx
import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';

export default function MyNewPage() {
  const [data, setData] = useState([]);

  useEffect(() => {
    // API 호출
  }, []);

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">페이지 제목</h1>
        {/* 내용 */}
      </div>
    </Layout>
  );
}
```

### 재사용 컴포넌트

```jsx
// src/components/custom-ui/MyComponent.jsx
export function MyComponent({ title, onClick }) {
  return (
    <div className="...">
      <h3>{title}</h3>
      <button onClick={onClick}>클릭</button>
    </div>
  );
}
```

---

## 🎯 라우팅

### 라우트 추가

```jsx
// src/routes/index.jsx
import MyNewPage from '@/pages/consumer/MyNewPage';

// routes 배열에 추가
{
  path: '/my-new-page',
  element: <MyNewPage />,
  private: true,  // 인증 필요 시
  roles: ['CONSUMER']  // 역할 제한 시
}
```

---

## 🔐 인증 및 권한

### Protected Route

```jsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

// 인증 필요한 페이지
<Route path="/mypage" element={
  <ProtectedRoute>
    <MyPage />
  </ProtectedRoute>
} />
```

### 역할별 접근 제어

```jsx
import { useAuth } from '@/context/AuthContext';

function MyComponent() {
  const { user, hasRole } = useAuth();

  if (hasRole('SELLER')) {
    return <SellerView />;
  }
  
  return <ConsumerView />;
}
```

---

## 📱 반응형 디자인

### Breakpoints (Tailwind)

```jsx
// Mobile First
<div className="
  p-4           /* mobile */
  md:p-6        /* tablet (768px+) */
  lg:p-8        /* desktop (1024px+) */
">
```

### 역할별 레이아웃

- **소비자**: 모바일 중심 (앱 느낌)
- **판매자/관리자**: 데스크톱 중심 (대시보드)

---

## 🧪 테스트

### 브라우저 테스트 (필수!)

모든 화면 구현 후 반드시 브라우저에서 확인:

```bash
# 개발 서버 실행
npm run dev

# 브라우저 접속
# http://localhost:3000

# 확인 사항:
# - 레이아웃이 올바른가?
# - 반응형이 작동하는가?
# - API 호출이 정상인가? (Network 탭)
# - 콘솔 에러가 없는가?
```

### 역할별 테스트

```
소비자: consumer1 / (환경변수 참조)
판매자: seller1 / (환경변수 참조)
관리자: admin1 / (환경변수 참조)
```

---

## 📚 참고 문서

- **프론트엔드 개발 계획**: `itdaing/docs/plan/FE-plan.md`
- **API 문서**: https://da-itdaing.github.io/sub-repo/
- **Kakao Map SDK**: https://apis.map.kakao.com/web/documentation/
- **Radix UI**: https://www.radix-ui.com/
- **Tailwind CSS**: https://tailwindcss.com/docs

---

## ⚠️ 주의사항

### 절대 커밋하지 말 것
- `.env.local` (로컬 환경 변수)
- `node_modules/` (NPM 패키지)
- `dist/` (빌드 결과)

### API 변경 시

백엔드 API가 변경되면:
1. `openapi.json` 업데이트 확인
2. TypeScript 타입 정의 수정
3. API 서비스 함수 수정
4. 테스트

---

## 🆘 문제 해결

### Push 실패 (403)

백엔드 가이드의 "Push 실패" 섹션 참조

### NPM 오류

```bash
# node_modules 재설치
rm -rf node_modules package-lock.json
npm install
```

### 빌드 오류

```bash
# Vite 캐시 삭제
rm -rf node_modules/.vite
npm run build
```

---

## 💬 협업 팁

1. **컴포넌트 재사용**
   - 중복 코드 지양
   - `components/custom-ui/`에 공통 컴포넌트 작성

2. **일관된 스타일**
   - Tailwind config에 정의된 색상 사용
   - 커스텀 CSS 최소화

3. **접근성 고려**
   - 시맨틱 HTML 사용
   - aria-label 추가

Happy Coding! 🎨

