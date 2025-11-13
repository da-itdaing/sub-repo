# 🎯 Work Instruction: Itdaing FE/BE Integration, Implementation, and Plan Updates

## 0. Reference Documents

Use the following three markdown files as your single source of truth:

- Backend plan: `BE-plan.md`

- Frontend plan: `FE-plan.md`

- Integration plan: `Integration Plan` (integration markdown)

Project structure:

- **Project root:** `@itdaing`

- **Frontend:** `@itdaing-web`

- **Backend:** all code in `@itdaing` **except** `@itdaing-web`

---

## 1. Overall Goals

1. Implement and update the actual code according to:

   - Backend “Next Steps” and TODOs in `BE-plan.md`

   - Frontend “Next Steps” and TODOs in `FE-plan.md`

   - Integration tasks in `Integration Plan`

2. Ensure that the frontend and backend are **fully connected and working in a real browser (@Browser)**:

   - API calls work end-to-end

   - Auth, data flow, and error handling behave as designed

3. Update all three markdown plans (`BE-plan.md`, `FE-plan.md`, `Integration Plan`) so that:

   - Status, checkboxes, and timelines match the **current, actual implementation**

   - Known issues and next steps are up to date

4. Fix as many **known issues / problems** listed in each document as possible, and explicitly reflect those fixes in the markdown files.

---

## 2. Scope and Priorities

### 2.1 Backend (`@itdaing`, excluding `@itdaing-web`)

Use `BE-plan.md` as the primary source for backend work.

1. In `BE-plan.md`, focus first on **“📝 앞으로 해야 할 작업 / Future Tasks”**:

   - Highest priority items:

     - Zone/Cell management API (admin)

       - Implement missing Cell CRUD:

         - `POST /api/geo/cells`

         - `PUT /api/geo/cells/{id}`

         - `DELETE /api/geo/cells/{id}`

         - `GET /api/geo/cells`

       - Implement missing Area update/delete:

         - `PUT /api/geo/areas/{id}`

         - `DELETE /api/geo/areas/{id}`

     - Approval management API (admin):

       - `GET /api/admin/approvals`

       - `POST /api/admin/approvals/{id}/approve`

       - `POST /api/admin/approvals/{id}/reject`

   - Then, address:

     - Popup search and filtering API (QueryDSL-based dynamic queries)

     - Recommendation API (`GET /api/recommendations`)

     - Statistics/analytics APIs for seller/admin dashboards

     - File upload completion: profile images, popup images, review images, plus validation and optimization

2. Align backend implementation with the **Integration Plan**:

   - Response format:

     - Success:

       ```json

       {

         "success": true,

         "data": { ... }

       }

       ```

     - Error:

       ```json

       {

         "success": false,

         "error": {

           "code": "ERROR_CODE",

           "message": "Error message",

           "details": { }

         }

       }

       ```

     - Pagination:

       ```json

       {

         "success": true,

         "data": {

           "content": [],

           "page": 0,

           "size": 20,

           "totalElements": 100,

           "totalPages": 5

         }

       }

       ```

   - Ensure controllers, services, and DTOs follow the response conventions defined in the integration document.

   - Ensure pagination contracts are consistent across domains.

3. Whenever you touch a domain (e.g., Zone/Cell, Area, Approval, Search), also:

   - Strengthen **business validation** (permissions, ownership, status checks).

   - Consider **security** (authorization for admin/seller/consumer).

   - Add or update **tests** for that area:

     - Service tests

     - Controller/API tests (MockMvc, etc.)

4. Review **“🐛 Known Issues”** in `BE-plan.md`:

   - If an issue has been fully resolved in code, mark it as **Resolved** and briefly note how.

   - If it still exists, update the description with:

     - Current behavior

     - Root cause (if known)

     - Planned fix or workaround

---

### 2.2 Frontend (`@itdaing-web`)

Use `FE-plan.md` as the primary source for frontend work.

1. In `FE-plan.md`, focus first on **“📝 앞으로 해야 할 작업 / Next Steps”** and **“Next Steps (High Priority)”**:

   High priority items:

   1. **Kakao Map API integration**

      - Install and configure `react-kakao-maps-sdk`.

      - Set up Kakao Map API key via environment variables.

      - Admin pages:

        - Draw Zone/Cell using DrawingManager (polygons, markers).

        - Save geometry as GeoJSON compatible with backend `ZoneArea` / `ZoneCell`.

      - Seller pages:

        - Display existing zones/cells from backend.

        - Provide UI to select zone/cell for popup.

      - Consumer pages:

        - Display popup locations on map (e.g., popup detail, nearby page).

   2. **User flow testing and UX improvement**

      - Test full flows using sample accounts:

        - Consumer: login → main → popup detail → my page → review create/edit/delete.

        - Seller: login → dashboard → popup management (create/edit/delete) → profile edit → messages/reviews as needed.

        - Admin: login → dashboard → zone management → approvals → user management.

      - Improve UX:

        - Loading states

        - Error messages

        - Empty states (when there is no data)

   3. **Error handling**

      - Confirm that:

        - Global `ErrorBoundary` is used appropriately.

        - Network errors show user-friendly messages.

        - Unauthorized (401) and forbidden (403) responses are handled consistently (e.g., auto logout or redirect, toast, etc.).

      - Ensure retry logic is correctly wired:

        - Only for retryable errors (e.g., network issues, 5xx).

        - Do not retry 401, 403, 404 where it doesn’t make sense.

2. Ensure the frontend is aligned with the **Integration Plan**:

   - **Auth flow**:

     - Axios interceptor sends JWT in `Authorization: Bearer <token>`.

     - Tokens are stored and refreshed as designed.

     - On token expiration, handle logout and redirect to login page.

   - **API response handling**:

     - Expect `{ success, data, error }` from backend.

     - Normalize error handling in shared helpers/services.

   - **Dev proxy / CORS**:

     - Confirm `vite.config.ts` has `/api` proxied to `http://localhost:8080`.

3. Implement or finalize Kakao Map-related features:

   - Make sure the UI and backend API contract for `ZoneArea` and `ZoneCell` are consistent:

     - IDs, geometry formats, field names.

   - All create/edit/delete/select actions must call real backend APIs rather than mock data.

4. Review **“🐛 Known Issues”** in `FE-plan.md`:

   - Mark already fixed items as **Resolved** and move them out of the active issues list if appropriate.

   - Keep only truly open issues, updated with:

     - Current symptoms

     - Impact

     - Planned resolution

---

### 2.3 Integration Perspective (Frontend + Backend + Integration Plan)

Use **`Integration Plan`** as the contract between frontend and backend.

1. Validate **“✅ Completed Integration Tasks / 🚧 Ongoing / 📝 Future Integration Tasks”**:

   - Check that all items marked as **Completed** are truly working in the code and in a real browser.

   - Implement items marked as **Ongoing** or **Future** that are in scope for this iteration:

     - Kakao Map integration

     - Message system UI integration (threads, replies, delete)

     - Admin area/zone/cell management UI

     - File upload UI integration

2. When modifying or adding features, ensure consistency with the Integration Plan in the following areas:

   - Data flow diagrams (auth, popup flow, review flow, file upload).

   - Response formats and error formats.

   - Security and permissions (roles: CONSUMER, SELLER, ADMIN).

   - Environment and deployment assumptions (ports, proxy, env variables).

3. **End-to-end verification with a real browser (@Browser)**:

   - Start backend (port 8080).

   - Start frontend (Vite dev server, e.g. port 5173).

   - Verify that the proxy `/api → http://localhost:8080` works as expected.

   - Test these flows using real sample accounts:

     - **Consumer** (`consumer1 / pass!1234`):

       - Login

       - View popup list and details

       - Write, edit, and delete reviews

       - Use my page (favorites, my reviews, etc.)

     - **Seller** (`seller1 / pass!1234`):

       - Login

       - View, create, edit, and delete own popups

       - Edit seller profile

       - (If implemented) use message system and review management

     - **Admin** (`admin1 / pass!1234`):

       - Login

       - Manage zones/areas/cells

       - Use approval UI (if implemented)

       - View system dashboard

   - Any bugs found during these tests should:

     - Be fixed in code where feasible.

     - Or be documented as known issues in the respective plan files.

---

## 3. Recommended Workflow and Deliverables

### 3.1 Recommended Order of Work

1. **Collect and organize TODOs**

   - From `BE-plan.md`, `FE-plan.md`, `Integration Plan`, extract:

     - “Future Tasks / Next Steps”

     - “In Progress”

     - “Known Issues”

     - “Integration Tasks / Checklists”

   - Select and confirm the tasks that are **in scope for this iteration**.

2. **Backend-first for new APIs**

   - For anything that requires new or updated endpoints (Cell, Area, Approval, Search, Recommendation, File Upload):

     - Implement backend logic, validations, and tests.

     - Document or confirm API shapes (request/response) in line with the Integration Plan.

3. **Frontend integration**

   - Wire API calls in services/hooks.

   - Connect UI forms and pages to real APIs.

   - Implement Kakao Map features and other pending UI work.

4. **End-to-end testing in @Browser**

   - Run through real user flows with sample accounts.

   - Fix blocking issues discovered during testing.

5. **Update the three plan markdown files**

   - Reflect actual status of:

     - Completed tasks

     - Ongoing tasks

     - Remaining issues

   - Make sure dates and “Last updated” fields are current.

---

## 4. Plan File Update Rules

After implementation and testing, **update all three markdown files** so they accurately reflect the current state.

### 4.1 `BE-plan.md` (Backend Plan)

- Mark completed items as checked (`- [x]`) or clearly labeled as **Done / Completed**.

- Add any new backend TODOs under the appropriate “Future Tasks” section.

- Update **“Known Issues”** as follows:

  - Issues that are fixed → mark as **Resolved** with a brief note.

  - Issues that remain → update their description and, if needed, link them to new tasks.

- Update the **“Last updated”** date to the current date.

### 4.2 `FE-plan.md` (Frontend Plan)

- Mark finished API integrations, form wiring, and UI features as **Completed**.

- Reflect the current status of:

  - Kakao Map integration

  - Error handling improvements

  - UX improvements (loading, errors, empty states)

- Ensure any mock-data-only sections are either:

  - Removed, or

  - Updated to indicate full backend integration is now in place.

- Update the **“Last updated”** date to the current date.

### 4.3 `Integration Plan` (Integration Document)

- Move actually completed integration work into **“Completed Integration Tasks”** and corresponding phases.

- Update **“Ongoing”** and **“Future”** sections to match reality:

  - Remove items that are truly done.

  - Add any new integration work that became necessary.

- Update:

  - Integration checklists

  - Test strategy sections

  - Deployment and environment notes

  so they reflect how the system currently works.

- Update the **“Last updated”** date to the current date.

---

## 5. Summary

1. **Code first, then docs** — but always ensure that `BE-plan.md`, `FE-plan.md`, and `Integration Plan` end up fully aligned with the actual implementation.

2. **Backend**: finish missing admin features (cells, areas, approvals, search, etc.), keep to the unified API contract, and strengthen validation, security, and tests.

3. **Frontend**: complete Kakao Map integration, finalize UI flows, and harden error handling and UX.

4. **Integration**: verify everything end-to-end in a real browser (@Browser) using sample accounts, fix what you can, and document what you can’t fix immediately.

You can copy and paste this entire instruction block directly into your repository (for example as `INTEGRATION_WORK_INSTRUCTION.md`) and use it as the working guideline for the current iteration.



@itdaing @itdaing-web @plan

You need to fix the below file.

@README.md 


