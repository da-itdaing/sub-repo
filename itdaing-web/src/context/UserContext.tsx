import React, { createContext, useContext, useState } from "react";

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
}

interface UserContextValue {
  profile: UserProfile | null;
  setProfile: (p: UserProfile | null) => void;
  loadPresetFor: (username: string) => void;
}

const defaultProfile: UserProfile = {
  userType: "consumer",
  username: "consumer1",
  name: "소비자1",
  nickname: "다잇1",
  email: "consumer1@example.com",
  ageGroup: "20대",
  interests: ["패션", "건강", "공연/전시"],
  moods: ["포토존", "실내", "야외"],
  regions: ["남구", "동구"],
  conveniences: ["무료주차", "굿즈판매"],
};

const Ctx = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }){
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const loadPresetFor = (username: string) => {
    if(username === "consumer1") setProfile(defaultProfile);
  };
  return <Ctx.Provider value={{ profile, setProfile, loadPresetFor }}>{children}</Ctx.Provider>;
}

export function useUser(){
  const ctx = useContext(Ctx);
  if(!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
