// Firebase 콘솔 > 프로젝트 설정 > 일반 > 내 앱(웹 앱)에서 발급받은 값으로 아래를 채워주세요.
// 이 값들은 클라이언트에 노출되는 것이 정상이며(비밀키 아님), 대신 Firestore 보안 규칙(firestore.rules)으로 접근을 제어합니다.
// 자세한 발급 방법은 README.md의 "Firebase 설정" 절을 참고하세요.
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};
