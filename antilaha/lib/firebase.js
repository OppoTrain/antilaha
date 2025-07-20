import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA88-_IcXpznpvbzgeMGceQ1pZcRA1j_eY",
  authDomain: "antilaha-v1.firebaseapp.com",
  projectId: "antilaha-v1",
  storageBucket: "antilaha-v1.firebasestorage.app",
  messagingSenderId: "71344475671",
  appId: "1:71344475671:web:99086cd731ce1fb7529652",
  measurementId: "G-V8350CG8YH"
}

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// ✅ Initialize Google Auth Provider
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" }); 

export { auth, db, storage, provider, app }; 
 
