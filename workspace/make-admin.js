const admin = require("firebase-admin");

const serviceAccount = require("./service-account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const uid = "TdlmOovYUcMes6j6bjuP4Crpz8Y2";

admin.auth().setCustomUserClaims(uid, { admin: true })
  .then(() => {
    console.log("✅ Admin set!");
    process.exit();
  })
  .catch((err) => {
    console.error("❌ Error:", err);
    process.exit(1);
  });