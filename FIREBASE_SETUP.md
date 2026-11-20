# Firebase setup status

Firebase project `applearning-3162d` is connected to the web app `工作日常助手`.

- Google sign-in is enabled. The app's GitHub Pages host, `steven20070308-art.github.io`, and `localhost` are authorized.
- The default Cloud Firestore database exists. The deployed `cloud.firestore` rules match `firestore.rules` and only allow each signed-in user to access their own `/users/{uid}/private/{document}` data.
- Firebase AI Logic uses the Gemini Developer API with `gemini-3.8-flash`.
- App Check is registered with a reCAPTCHA Enterprise web key restricted to `steven20070308-art.github.io` and `localhost`. Gemini requests use limited-use App Check tokens.
- The Firebase web app config and public App Check site key are in `firebase-auth.js`. Do not add Admin SDK or service account credentials to the browser or repository.

## Before the app changes go live

Deploy the updated static files to GitHub Pages, then test Google sign-in and cross-device Firestore sync with the same Google account. On mobile, open the Pages URL directly in Safari or Chrome; embedded browsers can block OAuth redirect state.

When Firebase Auth settings change, deploy with `npx -y firebase-tools@latest deploy --only auth`. Firestore rules are declared in `firestore.rules` and `firebase.json`.
