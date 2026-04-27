
const admin = require("firebase-admin");

// The user's UID is now passed as a command-line argument.
const uid = process.argv[2];

if (!uid) {
  console.error("❌ Error: Please provide the user's UID as a command-line argument.");
  console.error("Usage: node workspace/make-admin.js <USER_UID>");
  process.exit(1);
}

try {
  const serviceAccount = require("./service-account.json");

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  admin.auth().setCustomUserClaims(uid, { admin: true })
    .then(() => {
      console.log(`✅ Admin claim set successfully for user: ${uid}`);
      process.exit();
    })
    .catch((err) => {
      console.error("❌ Error setting custom claims:", err.message);
      process.exit(1);
    });

} catch (error) {
  if (error.code === 'MODULE_NOT_FOUND') {
    console.error("❌ Error: The 'service-account.json' file was not found in the 'workspace' directory.");
    console.error("Please download it from your Firebase project settings and place it in the correct folder.");
  } else {
    console.error("❌ An unexpected error occurred:", error.message);
  }
  process.exit(1);
}
