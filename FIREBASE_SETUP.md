# Firebase setup checklist

Firebase-backed Google sign-in and Firestore sync are wired in `firebase-auth.js`, but the Firebase project configuration must be added before deployment.

1. Create/open a Firebase project and register a Web App.
2. Copy its `apiKey`, `authDomain`, `projectId`, and `appId` into `firebase-auth.js` (`firebaseConfig`). These web config values identify the Firebase project; the security boundary must be Firebase Auth and Firestore Rules. Never put Admin SDK/service account credentials in the browser or repository.
3. In Firebase Authentication, enable Google as a sign-in provider.
4. Add `steven20070308-art.github.io` to Authentication > Settings > Authorized domains (also add `localhost` for local testing).
5. Create a Cloud Firestore database. Review `firestore.rules` and publish the rules. They restrict each account to its own `/users/{uid}/private/{document}` path.
6. Deploy the updated site to GitHub Pages and test sign-in plus data sync with the same Google account on a computer and a phone.

The first sign-in asks whether to upload this browser's existing data when the cloud account is empty. If cloud data already exists and local data exists, it asks whether to use cloud data or keep and upload local data. On mobile, prefer opening the Pages URL directly in Safari or Chrome instead of an embedded in-app browser; privacy/partitioned-storage contexts can block Firebase OAuth redirect state.
