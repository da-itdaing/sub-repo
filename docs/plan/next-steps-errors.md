# Next Steps Error Log

## 2025-11-13 – UI logout failure while verifying heart/login flow

- **Symptom:** Clicking the header `Logout` button in the browser automation threw a client-side error (`AuthContext.logout` rejected) and the session remained active.
- **Root cause:** The Spring Boot backend (port 8080) was not running, so the `/api/auth/logout` request failed and the promise rejection bubbled up to the UI.
- **Resolution:** Start the backend before exercising the auth flows:
  ```bash
  cd /home/ubuntu/itdaing
  ./gradlew bootRun
  ```


