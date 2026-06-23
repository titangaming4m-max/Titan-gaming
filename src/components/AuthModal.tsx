import React, { useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, User } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { motion, AnimatePresence } from "motion/react";
import { X, Mail, ShieldAlert, CheckCircle2, UserPlus, LogIn, Sparkles } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
}

export default function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (isSignUp) {
        // Sign Up Flow
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Seed default profile state in Firestore as required by relational schemas
        const userRef = doc(db, "users", user.uid);
        await setDoc(userRef, {
          email: user.email,
          createdAt: new Date().toISOString(),
          favoriteVideoIds: [],
          redeemedCodeIds: []
        });

        setSuccess("Account constructed! Welcome to Titan Gaming.");
        setTimeout(() => {
          onAuthSuccess(user);
          onClose();
        }, 1500);
      } else {
        // Login Flow
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        setSuccess("Authenticated successfully!");
        setTimeout(() => {
          onAuthSuccess(userCredential.user);
          onClose();
        }, 1200);
      }
    } catch (err: any) {
      console.error("Auth process failed:", err);
      
      // If the email provider is disabled in Firebase console, seamlessly fallback to local sandbox mode
      if (err.code === "auth/operation-not-allowed") {
        setSuccess("Email auth is currently disabled in console config. Transitioning seamlessly to High-Fidelity Local bypass session...");
        setTimeout(() => {
          const targetEmail = email.trim() || "demo-member@titan-gaming.com";
          localStorage.setItem("temp_member", targetEmail);
          
          const storeKey = `profile_temp-member-${targetEmail.replace(/[^a-zA-Z0-9]/g, "")}`;
          if (!localStorage.getItem(storeKey)) {
            localStorage.setItem(storeKey, JSON.stringify({
              email: targetEmail,
              createdAt: new Date().toISOString(),
              favoriteVideoIds: [],
              redeemedCodeIds: []
            }));
          }
          const simulatedUser = {
            email: targetEmail,
            uid: `temp-member-${targetEmail.replace(/[^a-zA-Z0-9]/g, "")}`,
            displayName: `Demo Member (${targetEmail.split("@")[0].toUpperCase()})`
          } as any;
          onAuthSuccess(simulatedUser);
          onClose();
        }, 1800);
        return;
      }

      let errMsg = err.message || "An expected credential anomaly occurred.";
      if (err.code === "auth/email-already-in-use") {
        errMsg = "This email is already registered. Please login instead. (You can also bypass & log in locally using the button below).";
      } else if (err.code === "auth/weak-password") {
        errMsg = "Password must be at least 6 characters long.";
      } else if (err.code === "auth/invalid-credential") {
        errMsg = "Invalid email or password combination. (To simulate a new account instantly, click 'Sign In / Bypass locally' below).";
      }
      setError(errMsg);
    } finally {
      // Keep loading indicator true if we are running the auto-fallback timeout transitions
      if (!email.trim() || !isSignUp) {
        setLoading(false);
      }
    }
  };

  const handleLocalBypass = () => {
    setError(null);
    setSuccess("Constructing high-fidelity local session!");
    
    const targetEmail = email.trim() || "demo-member@titan-gaming.com";
    localStorage.setItem("temp_member", targetEmail);
    
    // Seed standard profile locally if not exists
    const storeKey = `profile_temp-member-${targetEmail.replace(/[^a-zA-Z0-9]/g, "")}`;
    if (!localStorage.getItem(storeKey)) {
      localStorage.setItem(storeKey, JSON.stringify({
        email: targetEmail,
        createdAt: new Date().toISOString(),
        favoriteVideoIds: [],
        redeemedCodeIds: []
      }));
    }

    setTimeout(() => {
      const simulatedUser = {
        email: targetEmail,
        uid: `temp-member-${targetEmail.replace(/[^a-zA-Z0-9]/g, "")}`,
        displayName: `Demo Member (${targetEmail.split("@")[0].toUpperCase()})`
      } as any;
      onAuthSuccess(simulatedUser);
      onClose();
    }, 1200);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#050408]/80 backdrop-blur-md"
        />

        {/* Modal Sheet container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md glass-card-premium overflow-hidden rounded-2xl "
        >
          {/* Top subtle visual lines */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyber-purple via-cyber-pink to-cyber-blue" />
          
          {/* Close trigger */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors duration-200"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="p-6 sm:p-8 space-y-6">
            <div className="text-center space-y-1.5">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-cyber-purple/20 to-cyber-blue/20 border border-white/10 text-white mb-2">
                {isSignUp ? <UserPlus className="h-5 w-5 text-cyber-blue" /> : <LogIn className="h-5 w-5 text-cyber-pink" />}
              </div>
              <h2 className="text-xl font-bold font-display text-white">
                {isSignUp ? "Build Member Account" : "Welcome back, Member"}
              </h2>
              <p className="text-xs text-gray-400">
                {isSignUp
                  ? "Forge a new profile to track favorited videos and claimed vouchers."
                  : "Sign in to access your saved gaming videos and redeemed rewards."}
              </p>
            </div>

            {/* Error messaging state */}
            {error && (
              <div className="rounded-xl border border-red-500/10 bg-red-950/20 p-3.5 text-xs text-red-400 flex items-start space-x-2">
                <ShieldAlert className="h-4.5 w-4.5 text-red-500 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {/* Success state */}
            {success && (
              <div className="rounded-xl border border-emerald-500/10 bg-emerald-950/20 p-3.5 text-xs text-emerald-400 flex items-start space-x-2">
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{success}</span>
              </div>
            )}

            {/* Credential entries */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono tracking-wider text-gray-400 uppercase font-bold">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3.5 flex items-center text-gray-500">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    id="user-auth-email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl py-2.5 pl-11 pr-4 text-xs font-semibold glass-input-premium focus:outline-none"
                    placeholder="Enter email address"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] font-mono tracking-wider text-gray-400 uppercase font-bold">
                  <span>Enter Password</span>
                  <span className="text-gray-500 normal-case font-normal lowercase">(Min 6 characters)</span>
                </div>
                <input
                  id="user-auth-password-input"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl py-2.5 px-4 text-xs font-semibold glass-input-premium focus:outline-none"
                  placeholder="Password passphrase"
                />
              </div>

              <button
                id="user-auth-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full rounded-xl mt-2 bg-gradient-to-r from-cyber-purple/95 to-cyber-blue/95 hover:from-cyber-blue hover:to-cyber-purple py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-cyber-purple/20 transition-all duration-300 cursor-pointer disabled:opacity-50"
              >
                {loading ? "COMMUNICATING WITH SECURITY ENGINE..." : isSignUp ? "Build Account" : "Login Member"}
              </button>
            </form>

            {/* Mode swapper details */}
            <div className="text-center space-y-4">
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                  setSuccess(null);
                }}
                className="text-xs text-gray-400 hover:text-cyber-blue transition-all duration-300 underline underline-offset-4"
              >
                {isSignUp ? "Already hold an account? Login here" : "Don't hold an account? Create one"}
              </button>

              <div className="flex items-center justify-center space-x-2 py-1">
                <span className="h-px bg-white/5 w-12" />
                <span className="text-[10px] uppercase font-mono tracking-widest text-gray-500">OR BYPASS</span>
                <span className="h-px bg-white/5 w-12" />
              </div>

              <button
                id="user-auth-bypass-btn"
                type="button"
                onClick={handleLocalBypass}
                className="w-full rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 hover:text-orange-300 border border-orange-500/25 py-2.5 text-xs font-bold tracking-wider transition-all duration-300 cursor-pointer focus:outline-none flex items-center justify-center space-x-2"
              >
                <Sparkles className="h-3.5 w-3.5 text-orange-400 animate-pulse" />
                <span>SIGN IN / BYPASS LOCALLY</span>
              </button>
            </div>


          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
