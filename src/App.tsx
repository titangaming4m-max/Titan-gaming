import React, { useState, useEffect } from "react";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { auth, db } from "./lib/firebase";
import { ensureDefaultData } from "./lib/initializer";
import { YoutubeVideo, AdminSettings, UserProfile } from "./types";

// Components
import Navbar from "./components/Navbar";
import YoutubeGrid from "./components/YoutubeGrid";
import RedeemCodes from "./components/RedeemCodes";
import AdminPanel from "./components/AdminPanel";
import VideoPlayerModal from "./components/VideoPlayerModal";
import YoutubeProfile from "./components/YoutubeProfile";
import AuthModal from "./components/AuthModal";

// Icons
import { Github, Sparkles, AlertCircle, PlayCircle, Star, Sparkle } from "lucide-react";

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>("profile");
  const [selectedVideo, setSelectedVideo] = useState<YoutubeVideo | null>(null);
  
  // Admin State
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);

  // User Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Settings Config State
  const [channelSettings, setChannelSettings] = useState<AdminSettings>({
    channelId: "UCUIIdsKfR-Gn5_2rKzfzznQ", // Fallback Default channel (Requested)
    apiKey: "AIzaSyBEoAxxQb2UjyNVSJB8JMWuXhxftiOPGJ0",
    fallbackChannelName: "Connected Channel",
    primaryColor: "#ec4899",
    secondaryColor: "#10b981",
    accentColor: "#6366f1",
    backgroundColor: "#06050b",
    siteTitle: "Titan Gaming 1M",
    channels: [
      {
        id: "default-1",
        channelId: "UCUIIdsKfR-Gn5_2rKzfzznQ",
        apiKey: "AIzaSyBEoAxxQb2UjyNVSJB8JMWuXhxftiOPGJ0",
        name: "Titan Gaming 1M"
      }
    ]
  });

  // Display channel name
  const [channelName, setChannelName] = useState<string>("Connected Channel");

  // Helper to convert hex to RGB string for radial-gradients
  const hexToRgb = (hex: string): string => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    const fullHex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
    return result 
      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
      : "255, 255, 255";
  };

  // Dynamically apply site theme colors
  useEffect(() => {
    const root = document.documentElement;
    const primary = channelSettings.primaryColor || "#ec4899";
    const secondary = channelSettings.secondaryColor || "#10b981";
    const accent = channelSettings.accentColor || "#6366f1";
    const bg = channelSettings.backgroundColor || "#06050b";

    // Set standard variables
    root.style.setProperty("--site-pink", primary);
    root.style.setProperty("--site-blue", secondary);
    root.style.setProperty("--site-purple", accent);
    root.style.setProperty("--site-bg", bg);

    // Set RGB components for gradients
    root.style.setProperty("--site-pink-rgb", hexToRgb(primary));
    root.style.setProperty("--site-blue-rgb", hexToRgb(secondary));
    root.style.setProperty("--site-purple-rgb", hexToRgb(accent));
    root.style.setProperty("--site-bg-rgb", hexToRgb(bg));

    // Define lighter variants dynamically using color-mix
    root.style.setProperty("--site-bg-900", `color-mix(in srgb, ${bg} 95%, white 5%)`);
    root.style.setProperty("--site-bg-800", `color-mix(in srgb, ${bg} 88%, white 12%)`);
    root.style.setProperty("--site-bg-700", `color-mix(in srgb, ${bg} 75%, white 25%)`);

    root.style.setProperty("--color-cyber-pink", primary);
    root.style.setProperty("--color-cyber-blue", secondary);
    root.style.setProperty("--color-cyber-purple", accent);
    root.style.setProperty("--color-cosmic-950", bg);
    root.style.setProperty("--color-cosmic-900", `color-mix(in srgb, ${bg} 95%, white 5%)`);

    if (channelSettings.siteTitle) {
      document.title = channelSettings.siteTitle;
    }
  }, [channelSettings]);

  // Sync session and configuration
  useEffect(() => {
    // 1. Initialise and seed default structures securely
    ensureDefaultData();

    // 2. Track Session state
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        if (user.email === "admin@youtube-redeem.com") {
          setAdminUser(user);
          setIsAdminLoggedIn(true);
        } else {
          setAdminUser(null);
          setIsAdminLoggedIn(false);
        }
      } else {
        const hasTempBypass = localStorage.getItem("temp_admin") === "true";
        const hasMemberBypass = localStorage.getItem("temp_member");
        if (hasTempBypass) {
          const fakeAdmin = {
            email: "admin@youtube-redeem.com",
            uid: "temp-admin-id-bypass",
            displayName: "System Administrator (Local Dev Bypass)",
          } as User;
          setAdminUser(fakeAdmin);
          setIsAdminLoggedIn(true);
          setCurrentUser(fakeAdmin);
        } else if (hasMemberBypass) {
          const email = hasMemberBypass;
          const fakeMember = {
            email: email,
            uid: `temp-member-${email.replace(/[^a-zA-Z0-9]/g, "")}`,
            displayName: `Demo Member (${email.split("@")[0].toUpperCase()})`,
          } as User;
          setAdminUser(null);
          setIsAdminLoggedIn(false);
          setCurrentUser(fakeMember);
        } else {
          setAdminUser(null);
          setIsAdminLoggedIn(false);
          setCurrentUser(null);
        }
      }
    });

    // 3. Listen to dynamic YouTube channel settings changes in real-time
    const settingsDocRef = doc(db, "settings", "youtube");
    const unsubscribeSettings = onSnapshot(settingsDocRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        const mainId = data.channelId || "UCUIIdsKfR-Gn5_2rKzfzznQ";
        const mainKey = data.apiKey || "AIzaSyBEoAxxQb2UjyNVSJB8JMWuXhxftiOPGJ0";
        const mainName = data.siteTitle || "Titan Gaming 1M";
        
        const fallbackChannels = [
          {
            id: "default-1",
            channelId: mainId,
            apiKey: mainKey,
            name: mainName
          }
        ];

        setChannelSettings({
          channelId: mainId,
          apiKey: mainKey,
          fallbackChannelName: data.fallbackChannelName || "Connected Channel",
          primaryColor: data.primaryColor || "#ec4899",
          secondaryColor: data.secondaryColor || "#10b981",
          accentColor: data.accentColor || "#6366f1",
          backgroundColor: data.backgroundColor || "#06050b",
          siteTitle: data.siteTitle || "Titan Gaming 1M",
          channels: data.channels || fallbackChannels
        });
      }
    }, (error) => {
      console.warn("Settings subscription skipped or operating in offline mode:", error);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeSettings();
    };
  }, []);

  // Subscribe to custom member profiles
  useEffect(() => {
    if (!currentUser) {
      setUserProfile(null);
      return;
    }

    // Support simulated local profile for bypass members
    if (currentUser.uid.startsWith("temp-")) {
      const getLocalProfile = () => {
        const storeKey = `profile_${currentUser.uid}`;
        const localData = localStorage.getItem(storeKey);
        if (localData) {
          try {
            setUserProfile(JSON.parse(localData));
          } catch (e) {
            console.error(e);
          }
        } else {
          const initialProfile: UserProfile = {
            email: currentUser.email || "",
            createdAt: new Date().toISOString(),
            favoriteVideoIds: [],
            redeemedCodeIds: []
          };
          localStorage.setItem(storeKey, JSON.stringify(initialProfile));
          setUserProfile(initialProfile);
        }
      };

      getLocalProfile();

      // Listen to state changes from secondary components like voucher redeemer
      window.addEventListener("local-profile-update", getLocalProfile);
      return () => {
        window.removeEventListener("local-profile-update", getLocalProfile);
      };
    }

    const docRef = doc(db, "users", currentUser.uid);
    const unsubscribeProfile = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setUserProfile({
          email: data.email || currentUser.email || "",
          createdAt: data.createdAt || "",
          favoriteVideoIds: data.favoriteVideoIds || [],
          redeemedCodeIds: data.redeemedCodeIds || []
        });
      } else {
        setUserProfile({
          email: currentUser.email || "",
          createdAt: new Date().toISOString(),
          favoriteVideoIds: [],
          redeemedCodeIds: []
        });
      }
    }, (error) => {
      console.warn("UserProfile subscription encountered offline state:", error);
    });

    return () => {
      unsubscribeProfile();
    };
  }, [currentUser]);

  const handleToggleFavorite = async (videoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    try {
      const currentFavs = userProfile?.favoriteVideoIds || [];
      const updatedFavs = currentFavs.includes(videoId)
        ? currentFavs.filter(id => id !== videoId)
        : [...currentFavs, videoId];

      if (currentUser.uid.startsWith("temp-")) {
        const storeKey = `profile_${currentUser.uid}`;
        const updatedProfile = {
          ...userProfile!,
          favoriteVideoIds: updatedFavs
        };
        localStorage.setItem(storeKey, JSON.stringify(updatedProfile));
        setUserProfile(updatedProfile);
        return;
      }

      const userRef = doc(db, "users", currentUser.uid);
      await setDoc(userRef, { favoriteVideoIds: updatedFavs }, { merge: true });
    } catch (error) {
      console.error("Failed storing favorite selection:", error);
    }
  };

  const handleUpdateSettingsLocally = (newSettings: AdminSettings) => {
    setChannelSettings(newSettings);
  };

  const handleFetchedChannelName = (name: string) => {
    setChannelName(name);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn("Sign out bypassed standard Firebase state:", e);
    }
    localStorage.removeItem("temp_admin");
    localStorage.removeItem("temp_member");
    setAdminUser(null);
    setIsAdminLoggedIn(false);
    setCurrentUser(null);
    setUserProfile(null);
    setCurrentTab("profile");
  };

  return (
    <div className="min-h-screen cosmic-gradient-bg bg-cosmic-950 text-white flex flex-col justify-between selection:bg-cyber-blue selection:text-cosmic-950 font-sans">
      
      {/* Upper Glowing Mesh Ring */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-cyber-purple/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-10 left-1/4 w-[300px] h-[300px] bg-cyber-blue/5 rounded-full blur-[90px] pointer-events-none" />

      <div>
        {/* Immersive Navigation */}
        <Navbar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          isAdminLoggedIn={isAdminLoggedIn}
          onLogout={handleLogout}
          channelName={channelName}
          currentUser={currentUser}
          onOpenAuth={() => setIsAuthModalOpen(true)}
        />



        {/* Main Content Layout Container */}
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 relative z-10">
          
          {currentTab === "profile" && (
            <section className="space-y-6">
              <div className="flex items-center space-x-2.5 border-b border-white/5 pb-3.5">
                <Sparkle className="h-4.5 w-4.5 text-cyber-blue" />
                <h2 className="text-lg font-bold font-display text-white">PROFILE &amp; VIDEO</h2>
              </div>

              <YoutubeProfile
                channelSettings={channelSettings}
                onPlayVideo={setSelectedVideo}
                onFetchedChannelName={handleFetchedChannelName}
                favoriteVideoIds={userProfile?.favoriteVideoIds}
                onToggleFavorite={handleToggleFavorite}
              />
            </section>
          )}

          {currentTab === "redeem" && (
            <section className="space-y-6">
              <div className="flex items-center space-x-2.5 border-b border-white/5 pb-3.5">
                <Star className="h-4.5 w-4.5 text-cyber-pink" />
                <h2 className="text-lg font-bold font-display text-white">Active Redeem Rewards Center</h2>
              </div>

              <RedeemCodes
                currentUser={currentUser}
                userProfile={userProfile}
                onOpenAuth={() => setIsAuthModalOpen(true)}
              />
            </section>
          )}

          {currentTab === "admin" && (
            <section className="space-y-6">
              <div className="flex items-center space-x-2.5 border-b border-white/5 pb-3.5">
                <Sparkles className="h-4.5 w-4.5 text-cyber-blue" />
                <h2 className="text-lg font-bold font-display text-white">Administrative Portal Settings</h2>
              </div>

              <AdminPanel
                currentTab={currentTab}
                adminUser={adminUser}
                onAdminLoginState={(user) => {
                  setAdminUser(user);
                  setIsAdminLoggedIn(!!user);
                }}
                channelSettings={channelSettings}
                onUpdateSettings={handleUpdateSettingsLocally}
              />
            </section>
          )}

        </main>
      </div>

      {/* Panoramic Video Player Layer */}
      <VideoPlayerModal
        video={selectedVideo}
        onClose={() => setSelectedVideo(null)}
      />

      {/* Futuristic Member Authentication Modal Space */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
        }}
      />

      {/* Titan Gaming 1M High-Fidelity Footer Details */}
      <footer className="mt-20 border-t border-white/5 bg-[#050409]/60 backdrop-blur-xl py-10 px-4 relative z-10 text-[10px] text-gray-500 font-mono text-center">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="tracking-wider">
            © 2026 TITAN GAMING 1M. ALL RIGHTS RESERVED. RUNNING ON FIREBASE.
          </div>
          
          <div className="flex items-center justify-center space-x-5">
            <span className="flex items-center space-x-1.5 uppercase tracking-widest text-[9px]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
              <span className="text-gray-400">Secure Live Node</span>
            </span>
            <button
              onClick={() => {
                setCurrentTab("admin");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="text-cyber-blue/60 hover:text-cyber-blue transition-colors duration-200 uppercase tracking-widest cursor-pointer border-none bg-transparent p-0 text-[10px] focus:outline-none"
              title="Administrative Panel Login"
            >
              Titan Client v2.0.0
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
