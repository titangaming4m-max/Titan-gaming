import { useState, useEffect } from "react";
import { collection, query, onSnapshot, orderBy, doc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { RedeemCode } from "../types";
import { Search, Copy, Check, Calendar, HelpCircle, ShieldCheck, Bookmark, Lock, Gift } from "lucide-react";

interface RedeemCodesProps {
  currentUser: any;
  userProfile: any;
  onOpenAuth: () => void;
}

export default function RedeemCodes({ currentUser, userProfile, onOpenAuth }: RedeemCodesProps) {
  const [codes, setCodes] = useState<RedeemCode[]>([
    {
      id: "default-1",
      title: "Premium Tech Upgrade",
      code: "MKBHD-SUPER-UPGRADE-2026",
      description: "Redeem this code to unlock 1 year of complimentary pro tier tools, custom cloud templates, and exclusive newsletter insights.",
      expiryDate: "2026-12-31",
      createdAt: new Date().toISOString(),
      active: true
    },
    {
      id: "default-2",
      title: "Ultimate Bundle Pack",
      code: "CYBER-DASH-SUMMER26",
      description: "Unlocks the Cyberpunk Cosmic Dashboard skin bundle and 500 tech credits for the marketplace interface.",
      expiryDate: "2026-08-15",
      createdAt: new Date().toISOString(),
      active: true
    },
    {
      id: "default-3",
      title: "VIP Early Access pass",
      code: "EARLY-ACCESS-VIP-99",
      description: "Grants instant admission to the beta testing program and lets you preview forthcoming video contents before release.",
      expiryDate: "2026-10-31",
      createdAt: new Date().toISOString(),
      active: true
    },
    {
      id: "default-4",
      title: "Community Appreciation Reward",
      code: "THANK-YOU-COMMUNITY-VAL26",
      description: "A special gratitude gift containing various desktop wallpapers, high-fidelity profile tags, and role badges.",
      expiryDate: "",
      createdAt: new Date().toISOString(),
      active: true
    }
  ]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    // 1. Fallback timer: if Firestore has not returned within 2 seconds, stop block loader and show seeded/offline list
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    // Sync promotional codes dynamically in real-time using Firestore Snapshot!
    const q = query(collection(db, "redeemCodes"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      clearTimeout(timer);
      const items: RedeemCode[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        items.push({
          id: doc.id,
          title: data.title || "",
          code: data.code || "",
          description: data.description || "",
          expiryDate: data.expiryDate || "",
          createdAt: data.createdAt || "",
          active: data.active !== undefined ? data.active : true,
        });
      });
      if (items.length > 0) {
        setCodes(items);
      }
      setLoading(false);
    }, (error) => {
      clearTimeout(timer);
      console.warn("Firestore sync skipped or operating in offline mode:", error);
      setLoading(false);
    });

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  const handleCopy = async (id: string, codeText: string) => {
    try {
      await navigator.clipboard.writeText(codeText);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.warn("Clipboard fallback usage:", err);
      // Fallback
      const input = document.createElement("input");
      input.value = codeText;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const [claimingId, setClaimingId] = useState<string | null>(null);

  const handleClaimReward = async (itemId: string, codeVal: string) => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    setClaimingId(itemId);
    try {
      const claimedList = userProfile?.redeemedCodeIds || [];

      // Handle simulated local bypass user
      if (currentUser.uid.startsWith("temp-")) {
        const storeKey = `profile_${currentUser.uid}`;
        if (!claimedList.includes(itemId)) {
          const updatedList = [...claimedList, itemId];
          const updatedProfile = {
            ...userProfile,
            redeemedCodeIds: updatedList
          };
          localStorage.setItem(storeKey, JSON.stringify(updatedProfile));
          window.dispatchEvent(new Event("local-profile-update"));
        }
        await navigator.clipboard.writeText(codeVal);
        setCopiedId(itemId);
        setTimeout(() => setCopiedId(null), 2500);
        return;
      }

      // 1. Save claimed code id to Firestore UserProfile
      const userRef = doc(db, "users", currentUser.uid);
      if (!claimedList.includes(itemId)) {
        const updatedList = [...claimedList, itemId];
        await setDoc(userRef, { redeemedCodeIds: updatedList }, { merge: true });
      }

      // 2. Seamlessly copy to clinical clipboard
      await navigator.clipboard.writeText(codeVal);
      setCopiedId(itemId);
      setTimeout(() => setCopiedId(null), 2500);
    } catch (error) {
      console.error("Voucher redemption failed:", error);
    } finally {
      setClaimingId(null);
    }
  };

  const isExpired = (expiryStr?: string) => {
    if (!expiryStr) return false;
    try {
      const expiry = new Date(expiryStr);
      // Set to end of expiry day
      expiry.setHours(23, 59, 59, 999);
      return expiry.getTime() < new Date().getTime();
    } catch {
      return false;
    }
  };

  const formatExpiry = (expiryStr?: string) => {
    if (!expiryStr) return "Permanent Code";
    try {
      const expiry = new Date(expiryStr);
      return `Expires: ${expiry.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })}`;
    } catch {
      return expiryStr;
    }
  };

  const filteredCodes = codes.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 glass-card-premium p-5 rounded-2xl">
        <div className="relative flex-1 max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-gray-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            id="redeem-search-input"
            type="text"
            placeholder="Search coupon codes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl py-2.5 pl-11 pr-4 text-xs font-medium text-white placeholder-gray-500 glass-input-premium focus:outline-none transition-all"
          />
        </div>

        <div className="text-[10px] font-mono text-[#a5a1ff]/70 self-end sm:self-auto uppercase tracking-wider">
          Database Synced • {filteredCodes.length} Rewards Available
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="relative h-12 w-12">
            <span className="absolute inset-0 rounded-full border-2 border-white/5"></span>
            <span className="absolute inset-0 rounded-full border-2 border-t-cyber-purple animate-spin"></span>
          </div>
          <p className="text-[10px] font-mono text-[#a5a1ff] tracking-widest animate-pulse">
            ESTABLISHING ENCRYPTED SECURE CHANNEL...
          </p>
        </div>
      ) : filteredCodes.length === 0 ? (
        <div className="glass-card-premium rounded-2xl py-16 text-center max-w-md mx-auto space-y-3">
          <Bookmark className="h-8 w-8 text-white/20 mx-auto" />
          <p className="text-gray-300 text-sm font-semibold">No redeem codes available.</p>
          <p className="text-[10px] text-gray-500 font-mono">Sign in as an administrator to populate promo items.</p>
        </div>
      ) : (
        /* Immersive Coupon Tickets Grid Layout */
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {filteredCodes.map((item) => {
            const expired = isExpired(item.expiryDate);
            const activeCode = item.active && !expired;
            
            return (
              <div
                key={item.id}
                id={`redeem-card-${item.id}`}
                className={`relative flex flex-col justify-between overflow-hidden rounded-2xl p-6 transition-all duration-300 group ${
                  expired
                    ? "border border-red-500/10 bg-red-950/5 opacity-50"
                    : "glass-card-premium glass-card-premium-hover"
                }`}
              >
                {/* Visual Glassmorphic glow indicator circles */}
                <div className={`absolute -right-16 -top-16 h-32 w-32 rounded-full blur-3xl opacity-15 transition-all duration-300 group-hover:scale-125 ${
                  expired ? "bg-red-500" : "bg-cyber-blue"
                }`} />

                {/* Sub-header structure */}
                <div className="space-y-3 relative z-10">
                  <div className="flex items-start justify-between">
                    <div>
                      {/* Expired status badges */}
                      <span className={`inline-flex items-center space-x-1 rounded-lg px-2 py-0.5 text-[9px] font-mono tracking-wider font-bold border ${
                        expired 
                          ? "bg-red-950/25 border-red-800/45 text-red-400" 
                          : !item.expiryDate
                            ? "bg-emerald-950/20 border-emerald-500/20 text-cyber-blue"
                            : "bg-indigo-950/20 border-cyber-purple/20 text-cyber-purple"
                      }`}>
                        {expired ? "EXPIRED" : !item.expiryDate ? "PERMANENT" : "ACTIVE EXCLUSIVE"}
                      </span>
                      <h3 className="mt-2 text-base font-extrabold font-display text-white group-hover:text-cyber-blue transition-colors duration-300">
                        {item.title}
                      </h3>
                    </div>

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black/40 border border-white/5 text-gray-400">
                      <ShieldCheck className={`h-4.5 w-4.5 ${expired ? "text-gray-600" : "text-cyber-blue animate-pulse"}`} />
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 leading-relaxed min-h-[48px]">
                    {item.description}
                  </p>
                </div>

                {/* Voucher Ticket Cutout Dashed Separator Detail */}
                <div className="relative my-4 -mx-6 flex items-center justify-between">
                  <span className="h-5 w-2.5 rounded-r-full bg-[#06050b] border-r border-t border-b border-white/5" />
                  <div className="h-px w-full border-t border-dashed border-white/10" />
                  <span className="h-5 w-2.5 rounded-l-full bg-[#06050b] border-l border-t border-b border-white/5" />
                </div>

                {/* Expiration + Copy Action Interface */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 relative z-10">
                  <div className="flex items-center space-x-1.5 text-[10px] font-mono text-gray-500">
                    <Calendar className="h-3.5 w-3.5 text-cyber-pink" />
                    <span>{formatExpiry(item.expiryDate)}</span>
                  </div>

                   {/* Copy / Claim Button Container */}
                  {userProfile?.redeemedCodeIds?.includes(item.id) ? (
                    <button
                      id={`claimed-btn-${item.id}`}
                      onClick={() => handleCopy(item.id, item.code)}
                      disabled={expired}
                      className="flex items-center justify-center space-x-2 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 px-5 py-2.5 text-xs font-bold tracking-wider transition-all duration-300 w-full sm:w-auto uppercase cursor-pointer"
                    >
                      <Check className="h-3.5 w-3.5 text-emerald-400 font-bold" />
                      <span>{copiedId === item.id ? "COPIED AGAIN" : "REDEEMED"}</span>
                    </button>
                  ) : currentUser ? (
                    <button
                      id={`claim-btn-${item.id}`}
                      onClick={() => handleClaimReward(item.id, item.code)}
                      disabled={expired || claimingId === item.id}
                      className={`flex items-center justify-center space-x-2 rounded-xl px-4 py-2.5 text-xs font-bold tracking-wider transition-all duration-300 w-full sm:w-auto uppercase cursor-pointer border border-white/10 ${
                        expired
                          ? "bg-white/5 text-gray-600 cursor-not-allowed border border-white/5"
                          : copiedId === item.id
                            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                            : "bg-gradient-to-r from-cyber-purple/90 to-cyber-blue/90 hover:from-cyber-blue hover:to-cyber-purple text-white shadow-[0_4px_15px_rgba(99,102,241,0.2)] hover:shadow-[0_4px_15px_rgba(16,185,129,0.2)]"
                      }`}
                    >
                      {claimingId === item.id ? (
                        <span>CLAIMING...</span>
                      ) : copiedId === item.id ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>COPIED</span>
                        </>
                      ) : (
                        <>
                          <Gift className="h-3.5 w-3.5 text-white/90" />
                          <span>CLAIM REWARD</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      id={`signin-claim-btn-${item.id}`}
                      onClick={onOpenAuth}
                      disabled={expired}
                      className="flex items-center justify-center space-x-2 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 px-4 py-2.5 text-xs font-bold tracking-wider transition-all duration-300 w-full sm:w-auto uppercase border border-orange-500/25 cursor-pointer focus:outline-none"
                    >
                      <Lock className="h-3.5 w-3.5 text-orange-400" />
                      <span>SIGN IN &amp; CLAIM</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
