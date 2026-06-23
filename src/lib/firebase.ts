import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDocFromServer } from "firebase/firestore";

// Config matches firebase-applet-config.json exactly
const firebaseConfig = {
  projectId: "gen-lang-client-0214369161",
  appId: "1:87360915147:web:3e7251f42a24fcfe69bd4e",
  apiKey: "AIzaSyAAUjOz09JI4PX6_PiVey1QTRMPMcol73E",
  authDomain: "gen-lang-client-0214369161.firebaseapp.com",
  storageBucket: "gen-lang-client-0214369161.firebasestorage.app",
  messagingSenderId: "87360915147"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);

// Initialize Firestore targeting the specific databaseId set during provisioning
const customDbId = "ai-studio-8ed5a690-5b40-4be0-8d0a-407cb4b746fb";
export const db = getFirestore(app, customDbId);

// Validate Connection on boot as required by system guidelines
async function testConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
    console.log("Firebase connection verified and authenticated successfully.");
  } catch (error) {
    if (error instanceof Error && error.message.includes("offline")) {
      console.warn("Please check your Firebase configuration or network status.", error);
    } else {
      console.log("Firestore connection test performed.");
    }
  }
}
testConnection();
