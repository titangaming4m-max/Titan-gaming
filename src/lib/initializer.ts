import { collection, getDocs, doc, getDoc, setDoc, writeBatch } from "firebase/firestore";
import { db } from "./firebase";
import { RedeemCode, AdminSettings } from "../types";

export async function ensureDefaultData() {
  try {
    // 1. Check & Initialize YouTube config settings
    const settingsRef = doc(db, "settings", "youtube");
    const settingsSnap = await getDoc(settingsRef);
    
    let currentSettings: AdminSettings = {
      channelId: "UCUIIdsKfR-Gn5_2rKzfzznQ", // Default YouTube channel ID (Requested)
      apiKey: "AIzaSyBEoAxxQb2UjyNVSJB8JMWuXhxftiOPGJ0", // Default YouTube API Key (Requested)
      fallbackChannelName: "Connected Channel"
    };

    if (!settingsSnap.exists() || settingsSnap.data()?.channelId === "UCBJycsmduvYELgTUnH0C9gQ") {
      await setDoc(settingsRef, currentSettings);
      console.log("Default YouTube channel configuration seeded or updated with requested custom values.");
    }

    // 2. Check & Initialize sample redeem codes
    const codesSnap = await getDocs(collection(db, "redeemCodes"));
    if (codesSnap.empty) {
      const defaultCodes: Omit<RedeemCode, "id">[] = [
        {
          title: "Premium Tech Upgrade",
          code: "MKBHD-SUPER-UPGRADE-2026",
          description: "Redeem this code to unlock 1 year of complimentary pro tier tools, custom cloud templates, and exclusive newsletter insights.",
          expiryDate: "2026-12-31",
          createdAt: new Date().toISOString(),
          active: true
        },
        {
          title: "Ultimate Bundle Pack",
          code: "CYBER-DASH-SUMMER26",
          description: "Unlocks the Cyberpunk Cosmic Dashboard skin bundle and 500 tech credits for the marketplace interface.",
          expiryDate: "2026-08-15",
          createdAt: new Date().toISOString(),
          active: true
        },
        {
          title: "VIP Early Access pass",
          code: "EARLY-ACCESS-VIP-99",
          description: "Grants instant admission to the beta testing program and lets you preview forthcoming video contents before release.",
          expiryDate: "2026-10-31",
          createdAt: new Date().toISOString(),
          active: true
        },
        {
          title: "Community Appreciation Reward",
          code: "THANK-YOU-COMMUNITY-VAL26",
          description: "A special gratitude gift containing various desktop wallpapers, high-fidelity profile tags, and role badges.",
          expiryDate: "",
          createdAt: new Date().toISOString(),
          active: true
        }
      ];

      const batch = writeBatch(db);
      defaultCodes.forEach((codeData) => {
        const newCodeDoc = doc(collection(db, "redeemCodes"));
        batch.set(newCodeDoc, codeData);
      });
      await batch.commit();
      console.log("Sample promotional redeem codes database records seeded.");
    }
  } catch (error) {
    console.warn("Database seeding omitted or delayed (network or permission restriction):", error);
  }
}
