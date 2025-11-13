export interface SellerProfile {
  userId: number;
  exists: boolean;
  profileImageUrl: string | null;
  introduction: string | null;
  activityRegion: string | null;
  snsUrl: string | null;
  email: string;
}
