# itdaing-web 프론트엔드 (React + Vite)

`itdaing-web` 폴더가 이제 백엔드 프로젝트 루트 `final-project/` 아래에 함께 위치합니다.
백엔드(Spring Boot)는 `/api/**` 를 처리하고, Nginx가 정적 파일(`/var/www/itdaing`)을 서비스하며 `/api/` 요청을 백엔드(8080)로 프록시합니다.

## 1. 개발 환경 실행

```bash
cd final-project/itdaing-web
npm install           # 최초 1회
npm run dev           # 기본 포트: 5173
```

브라우저에서: `http://localhost:5173` (백엔드 API를 호출할 때는 프록시 설정을 직접 구성하거나, 운영 환경과 달리 절대경로 `/api/...` 사용 권장)

## 2. 빌드

```bash
npm run build         # dist/ 생성
```

생성 결과: `final-project/itdaing-web/dist/` 폴더

## 3. 운영 반영 (배포)

운영 서버(Nginx)가 정적 루트로 `/var/www/itdaing` 을 사용한다고 가정:

```bash
# 로컬/EC2 동일 서버에서 수동 배포
sudo rsync -av --delete final-project/itdaing-web/dist/ /var/www/itdaing/
sudo nginx -t && sudo systemctl reload nginx
```

반복 작업을 쉽게 하기 위해 `scripts/deploy-frontend.sh` 스크립트를 추가했습니다:

```bash
./scripts/deploy-frontend.sh           # 기본: dist 빌드 후 /var/www/itdaing 동기화
TARGET_DIR=/var/www/another ./scripts/deploy-frontend.sh   # 대상 디렉터리 변경
SKIP_INSTALL=1 ./scripts/deploy-frontend.sh                # npm install 건너뛰기
```

## 4. 변경사항 검증 방법

배포 후 아래를 통해 새 빌드가 적용되었는지 확인합니다.

1. 헤더 확인 (200 + 최신 파일):
	```bash
	curl -I http://<domain>/ | grep -i 'etag\|last-modified\|content-length'
	```
2. 인덱스 파일 해시(선택):
	```bash
	sha256sum final-project/itdaing-web/dist/index.html
	curl -s http://<domain>/index.html | sha256sum
	# 두 해시가 동일하면 최신 파일이 반영된 것
	```
3. 정적 자산 버전(빌드 시점) 표시를 위해 필요하면 `index.html` 에 간단히 주석 추가:
	```html
	<!-- build: 2025-11-08T12:34:00Z -->
	```
	또는 `package.json` 의 version을 화면에 출력하도록 컴포넌트에 반영.
4. 브라우저 강제 새로고침 (캐시 무효화): `Ctrl+Shift+R` / DevTools > Disable cache 체크.
5. API 프록시 동작 확인:
	```bash
	curl -i http://<domain>/api/actuator/health
	```

## 5. 폴더 구조 요약

```
final-project/
  itdaing-web/
	 src/        # React 소스
	 dist/       # 프로덕션 빌드 산출물 (npm run build 후)
  src/main/...  # Spring Boot 백엔드
  scripts/      # 배포 스크립트 등
```

## 6. ESLint / 품질

기본 템플릿 그대로이며 필요 시 다음을 추가 고려:
- 절대경로 import 설정 (vite alias)
- 환경별 `.env` 파일 (`VITE_API_BASE=/api` 등)
- Lighthouse/웹 성능 측정 자동화

## 7. Vite 및 React 플러그인 메모

- `@vitejs/plugin-react-swc` 사용 (빠른 HMR)
- React Compiler는 현재 SWC와 호환되지 않음: 진행 상황은 [이슈](https://github.com/vitejs/vite-plugin-react/issues/428) 참고

## 8. 향후 개선 아이디어

- 빌드 결과에 릴리즈 태그 삽입 (예: `RELEASE.txt` -> Nginx add_header로 노출 가능)
- CloudFront/S3 정적 호스팅 이전 검토
- GitHub Actions로 자동 빌드 & 배포 (캐시 활용)

---
기존 Vite 템플릿 설명은 아래 원문을 참고하세요.

---

## Original Vite Template Notes

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

React Compiler is not currently compatible with SWC. See [this issue](https://github.com/vitejs/vite-plugin-react/issues/428) for tracking the progress.

For production apps, consider TypeScript + type-aware ESLint rules. See the TS template for integration details.
