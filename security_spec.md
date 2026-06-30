# Security Specification for Firestore Security Rules

This specification establishes the hard boundaries and security requirements for the Firestore database of UniversityTutors app.

## 1. Data Invariants

1. **User Identity Isolation**: A user profile (`/users/{userId}`) can only be created or modified by the user themselves (`request.auth.uid == userId`).
2. **Immutability of Role on Creation**: A standard user can register their role, but once registered, standard users cannot escalate their role to Admin (or downgrade/change fields like `role` or `suspended` without administrator credentials).
3. **Master Gate Chat Authorization**: Only the authorized `studentId` or `tutorId` listed in `/chats/{chatId}` can read or write deep elements like messages or quotes inside `/chats/{chatId}/*`.
4. **Assignment Self-Ownership**: Access to an assignment `/assignments/{assignmentId}` requires that the requester be either the `studentId` or the `tutorId` on that assignment, or be a validated Administrator.
5. **System-Controlled Fields**: Critical fields like `stripePaymentIntent` or payment status can only be updated under atomic, secure operations, and standard users cannot randomly edit payments or release escrow without tutor deliverable completion.
6. **Temporal Consistency**: Built-in timestamps (`createdAt`, `updatedAt`, `timestamp`) must always sync perfectly with `request.time`.

---

## 2. The "Dirty Dozen" Malicious Payloads

The following represent 12 specific exploit payloads designed to bypass identity, integrity, and safety rules. All must result in `PERMISSION_DENIED`:

### Payload 1: Unauthorized Profile Intrusion
* **Operation**: Create user document `users/tutor_clara` as user `hacker_bob`.
* **Payload**:
  ```json
  {
    "id": "tutor_clara",
    "name": "Hacker Bob",
    "email": "bob@hacker.com"
  }
  ```

### Payload 2: Admin Privilege Escalation (Self-Appointed Role)
* **Operation**: Create/Update user document `users/hacker_bob` where they attempt to set `role: "admin"`.
* **Payload**:
  ```json
  {
    "id": "hacker_bob",
    "role": "admin",
    "name": "Bob"
  }
  ```

### Payload 3: Chat Eavesdropping (Unrelated Client)
* **Operation**: Read `chats/chat_sample_1` where `studentId` is `student_alex` and `tutorId` is `tutor_clara`, requested by `hacker_bob`.
* **Expectation**: `PERMISSION_DENIED`.

### Payload 4: Spoofed Message Sender (Identity Spoofing)
* **Operation**: Write to `chats/chat_sample_1/messages/msg_exploit_1` with `senderId: "tutor_clara"`, requested by `student_alex`.
* **Payload**:
  ```json
  {
    "id": "msg_exploit_1",
    "chatId": "chat_sample_1",
    "senderId": "tutor_clara",
    "content": "I am releasing all outstanding fees for free!",
    "timestamp": "2026-06-10T09:40:00Z"
  }
  ```

### Payload 5: Quote Tampering (Tutor Impersonation)
* **Operation**: Create quote `/chats/chat_sample_1/quotes/quote_9` as student `student_alex` claiming a high payment quote.
* **Payload**:
  ```json
  {
    "id": "quote_9",
    "chatId": "chat_sample_1",
    "amount": 900,
    "estimatedHours": 20,
    "status": "pending",
    "createdAt": "2026-06-10T09:40:00.000Z"
  }
  ```

### Payload 6: Assignment Word Hijack (Blanket Edit)
* **Operation**: Update assignment `/assignments/assign_1` (which belongs to Clara and Alex) by a complete stranger `hacker_bob`.
* **Expectation**: `PERMISSION_DENIED`.

### Payload 7: Fake Escrow Release (Bypassing Tutor Delivery)
* **Operation**: Update payment `payments/pay_1` directly from student client to bypass escrow release, setting `status` to `released` without tutor work file.
* **Payload**:
  ```json
  {
    "status": "released"
  }
  ```

### Payload 8: Deny-of-Wallet Character Poisoning
* **Operation**: Create support ticket with a massive, bloated 2MB message payload or non-alphanumeric special character ID.
* **Expectation**: `PERMISSION_DENIED`.

### Payload 9: Blog Erasure (Non-Admin Deletion)
* **Operation**: Delete blog `/blogs/blog_1` as a standard Student user.
* **Expectation**: `PERMISSION_DENIED`.

### Payload 10: FAQ Disruption (Anonymous Modification)
* **Operation**: Update `/faqs/faq_1` without active admin authentication.
* **Expectation**: `PERMISSION_DENIED`.

### Payload 11: Future/Past Spoofed Timing
* **Operation**: Create msg with `timestamp: "2099-01-01T00:00:00.000Z"` which deviates from the actual server time.
* **Expectation**: `PERMISSION_DENIED`.

### Payload 12: Fraudulent Review Generation
* **Operation**: Add a review under `/reviews/rev_fake` with student name "Oliver Smith" rating 5, while not authenticated.
* **Expectation**: `PERMISSION_DENIED`.
