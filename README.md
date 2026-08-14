# 반응속도 측정 웹앱

화면이 파란색에서 빨간색으로 바뀌는 순간부터 클릭까지 걸린 시간(ms)을 측정하는 웹앱입니다.
프론트엔드는 GitHub Pages에, 기록 저장은 Firebase(Firestore)를 사용합니다.

## 동작

1. 파란 화면에서 클릭하면 게임이 시작됩니다.
2. 1~12초 사이 랜덤한 시간이 지나면 화면이 빨간색으로 바뀝니다.
3. 빨간색이 된 뒤 클릭하면 반응 속도(ms)가 초록 화면에 표시됩니다.
4. 결과 화면에서 닉네임을 입력하고 저장하면 Firestore에 기록이 저장됩니다.
5. 빨간색으로 바뀌기 전에 클릭하면 실패 처리되고 시작 화면으로 돌아갑니다.
6. 결과 화면에는 최고 기록 TOP 10(랭킹)이 함께 표시됩니다.

## 파일 구조

- `index.html`, `style.css` — 화면 구조와 스타일
- `app.js` — 게임 상태 머신(반응속도 측정 로직)
- `firebase.js` — `saveScore(ms, nickname)`, `getTop(n)` 두 함수로 분리된 Firestore 연동
- `firebase-config.js` — Firebase 프로젝트 설정 값 (아래 안내에 따라 직접 채워야 함)
- `firestore.rules` — Firestore 보안 규칙
- `.github/workflows/deploy-pages.yml` — GitHub Pages 자동 배포 워크플로우

## Firebase 설정 (필수, 직접 진행해야 하는 부분)

이 프로젝트는 Firebase 프로젝트 자체는 생성해 두지 않았습니다. 아래 순서대로 진행해주세요.

1. [Firebase 콘솔](https://console.firebase.google.com/)에서 새 프로젝트를 생성합니다.
2. 프로젝트 안에서 **Firestore Database**를 생성합니다 (모드는 아무거나 선택해도 되며, 아래 3번 규칙으로 덮어씁니다).
3. Firestore 콘솔의 **규칙(Rules)** 탭에 이 저장소의 `firestore.rules` 내용을 그대로 붙여넣고 게시합니다.
4. Firebase 콘솔 좌측 상단 **프로젝트 설정(⚙) > 일반** 탭으로 이동해 "내 앱" 섹션에서 웹 앱(</>)을 추가합니다.
5. 발급되는 `firebaseConfig` 객체 값을 이 저장소의 `firebase-config.js` 파일에 그대로 붙여넣습니다.
   - `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId` 전부 채워야 합니다.
   - 이 값들은 비밀키가 아니라 클라이언트에 공개되는 값이라 커밋해도 안전하며, 실제 접근 제어는 3번의 Firestore 규칙이 담당합니다.
6. `firebase-config.js` 수정 후 커밋/푸시하면 GitHub Pages에 반영됩니다.

## GitHub Pages 배포

1. 저장소 **Settings > Pages**에서 Source를 **GitHub Actions**로 설정합니다.
2. `main` 브랜치가 기본 브랜치이며, `main`에 push될 때 `.github/workflows/deploy-pages.yml`이 자동으로 정적 파일을 배포합니다.
3. 배포 후 URL은 Settings > Pages 또는 워크플로우 실행 결과에서 확인할 수 있습니다.

## 로컬 확인

빌드 과정이 없는 순수 정적 파일이므로, 정적 서버로 폴더를 열면 됩니다. 예:

```bash
python3 -m http.server 8080
```

이후 브라우저에서 `http://localhost:8080` 접속. (단, `firebase-config.js`에 실제 값을 채워야 저장/랭킹 기능이 동작합니다.)
