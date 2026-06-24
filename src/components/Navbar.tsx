import React from "react";
import { Tv, Ticket, Lock, Sparkles, Youtube, Menu, X, User } from "lucide-react";

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isAdminLoggedIn: boolean;
  onLogout: () => void;
  channelName: string;
  currentUser: any;
  onOpenAuth: () => void;
}

export default function Navbar({
  currentTab,
  setCurrentTab,
  isAdminLoggedIn,
  onLogout,
  channelName,
  currentUser,
  onOpenAuth,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const tabs = [
    { id: "profile", name: "Profile & Video", icon: User },
    { id: "redeem", name: "Redeem Codes", icon: Ticket },
  ];

  return (
    <nav className="sticky top-0 z-40 border-b border-white/5 bg-[#08070e]/70 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo Brand Brand */}
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyber-purple/20 via-cyber-pink/10 to-cyber-blue/20 text-white border border-white/10 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
              <Youtube className="h-5 w-5 text-cyber-pink animate-pulse" />
            </div>
            <div>
              <span className="font-display text-lg font-extrabold tracking-tight text-white block uppercase">
                TITAN GAMING <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-blue to-cyber-purple">1M</span>
              </span>
              <span className="text-[9px] font-mono tracking-widest text-[#a5a1ff]/75 block -mt-1 uppercase">
                Official Hub
              </span>
            </div>
          </div>

          {/* Desktop Navigation Items */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-center space-x-1.5 bg-black/40 p-1 rounded-xl border border-white/5">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = currentTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    id={`nav-btn-${tab.id}`}
                    onClick={() => setCurrentTab(tab.id)}
                    className={`flex items-center space-x-2 rounded-lg px-4 py-2 text-xs font-semibold tracking-wide transition-all duration-300 ${
                      isActive
                        ? "bg-gradient-to-r from-cyber-purple/90 to-cyber-blue/90 text-white shadow-[0_4px_15px_rgba(99,102,241,0.3)] border border-white/10"
                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </div>

            <div className="h-5 w-px bg-white/10" />

            {/* User Session Core Control */}
            {currentUser ? (
              <div className="flex items-center space-x-3">
                {isAdminLoggedIn ? (
                  <button
                    id="nav-btn-admin"
                    onClick={() => setCurrentTab("admin")}
                    className={`flex items-center space-x-1.5 rounded-xl border px-3 py-1.5 text-xs font-mono tracking-wider transition-all duration-300 ${
                      currentTab === "admin"
                        ? "border-cyber-blue bg-cyber-blue/10 text-cyber-blue shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                        : "border-white/10 bg-white/5 text-cyber-blue hover:border-cyber-blue/30 hover:bg-cyber-blue/5"
                    }`}
                  >
                    <Sparkles className="h-3.5 w-3.5 text-cyber-blue animate-pulse" />
                    <span>ADMIN COMPANION</span>
                  </button>
                ) : (
                  <div className="hidden sm:flex items-center space-x-1.5 rounded-xl border border-cyber-pink/30 bg-cyber-pink/5 px-3 py-1.5 text-xs font-mono tracking-wider text-cyber-pink">
                    <User className="h-3 w-3 text-cyber-pink" />
                    <span className="uppercase font-bold">WELCOME BACK, MEMBER: {currentUser.email?.split("@")[0].toUpperCase()}</span>
                  </div>
                )}
                <button
                  id="nav-btn-logout"
                  onClick={onLogout}
                  className="rounded-xl bg-red-950/30 border border-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500 hover:text-white transition-all duration-300"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  id="nav-btn-user-signin"
                  onClick={onOpenAuth}
                  className="flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-cyber-purple via-cyber-pink to-cyber-blue px-3.5 py-1.5 text-xs font-bold tracking-wide text-white transition-all duration-300 hover:shadow-[0_0_15px_rgba(236,72,153,0.3)] shadow-md cursor-pointer"
                >
                  <User className="h-3.5 w-3.5 fill-current" />
                  <span>Sign In</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-lg p-2 text-gray-400 hover:bg-cosmic-900 hover:text-white"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/5 bg-[#08070e]/95 backdrop-blur-2xl px-4 py-3 space-y-3 shadow-2xl">
          <div className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setCurrentTab(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex w-full items-center space-x-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-cyber-purple/20 to-cyber-blue/20 border border-cyber-purple/30 text-white shadow-[0_0_15px_rgba(99,102,241,0.15)]"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>

          <div className="h-px bg-white/5 my-2" />

          {currentUser ? (
            <div className="space-y-2">
              {isAdminLoggedIn ? (
                <button
                  onClick={() => {
                    setCurrentTab("admin");
                    setMobileMenuOpen(false);
                  }}
                  className={`flex w-full items-center justify-center space-x-2 rounded-xl px-4 py-2 text-xs font-semibold border ${
                    currentTab === "admin"
                      ? "border-cyber-blue bg-cyber-blue/15 text-cyber-blue"
                      : "border-white/10 bg-white/5 text-cyber-blue"
                  }`}
                >
                  <Sparkles className="h-4 w-4" />
                  <span>ADMIN PANEL</span>
                </button>
              ) : (
                <div className="flex w-full items-center justify-center space-x-2 rounded-xl border border-cyber-pink/25 bg-cyber-pink/5 px-4 py-2 text-xs font-mono text-cyber-pink font-bold uppercase">
                  <User className="h-4 w-4" />
                  <span>WELCOME BACK, MEMBER: {currentUser.email?.split("@")[0].toUpperCase()}</span>
                </div>
              )}
              <button
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-center rounded-xl bg-red-950/20 border border-red-500/20 px-4 py-2 text-xs font-semibold text-red-400 hover:bg-red-950 transition-all focus:outline-none cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="w-full">
              <button
                onClick={() => {
                  onOpenAuth();
                  setMobileMenuOpen(false);
                }}
                className="flex w-full items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-cyber-purple via-cyber-pink to-cyber-blue px-4 py-3 text-xs font-bold text-white shadow-lg focus:outline-none cursor-pointer"
              >
                <User className="h-4 w-4" />
                <span>SIGN IN TO MEMBER ACCESS</span>
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
