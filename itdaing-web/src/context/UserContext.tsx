import React, { createContext, useCallback, useContext, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

export type UserType = "consumer" | "seller" | null;

export interface UserProfile {
  userType: UserType;
  username: string;
  name: string;
  nickname: string;
  email: string;
  ageGroup?: string;
  interests: string[];
  moods: string[];
  regions: string[];
  conveniences: string[];
  favorites?: number[];
  recentViewed?: number[];
  recommendations?: number[];
}

interface UserContextValue {
  profile: UserProfile | null;
  setProfile: (p: UserProfile | null) => void;
  loadPresetFor: (username: string) => void;
}

const Ctx = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }){
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const loadPresetFor = useCallback((username: string) => {
    const target = username?.trim();
    if (!target) {
      setProfile(null);
      return;
    }

    fetch(`${API_BASE}/api/dev/users/${target}`, { credentials: "include" })
      .then(res => {
        if (!res.ok) throw new Error(`Failed to load profile for ${target}`);
        return res.json();
      })
      .then(body => {
        if (body?.success && body.data) {
          setProfile(body.data as UserProfile);
          return;
        }
        if (body?.profile) {
          setProfile(body.profile as UserProfile);
          return;
        }
        throw new Error("Invalid profile response");
      })
      .catch(() => {
        fetch("/mock/users/consumers.json")
          .then(res => res.json())
          .then((list: UserProfile[] | { profile?: UserProfile }) => {
            if (Array.isArray(list)) {
              const found = list.find(item => item.username?.toLowerCase() === target.toLowerCase());
              if (found) {
                setProfile({ ...found, userType: found.userType ?? "consumer" });
                return;
              }
            } else if (list?.profile) {
              setProfile(list.profile);
              return;
            }
            throw new Error("Preset not found");
          })
          .catch(() => {
            setProfile({
              userType: "consumer",
              username: "consumer1",
              name: "소비자1",
              nickname: "소비왕",
              email: "consumer1@example.com",
              ageGroup: "20대",
              interests: ["패션", "건강", "공연/전시"],
              moods: ["포토존", "실내", "야외"],
              regions: ["남구", "동구"],
              conveniences: ["무료주차", "굿즈판매"]
            });
          });
      });
  }, []);
  return <Ctx.Provider value={{ profile, setProfile, loadPresetFor }}>{children}</Ctx.Provider>;
}

export function useUser(){
  const ctx = useContext(Ctx);
  if(!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
