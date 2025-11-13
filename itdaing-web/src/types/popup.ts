export interface PopupOperatingHour {
  day: string;
  time: string;
}

export interface PopupReviewSummary {
  averageRating: number;
  totalCount: number;
  distribution: number[];
}

export interface PopupSummary {
  id: number;
  title: string;
  sellerId: number;
  sellerName: string | null;
  zoneId: number;
  cellId: number;
  cellName: string | null;
  locationName: string | null;
  address: string | null;
  status: string;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  startDate: string | null;
  endDate: string | null;
  hours: string | null;
  operatingHours: PopupOperatingHour[];
  description: string | null;
  viewCount: number;
  favoriteCount: number;
  categoryIds: number[];
  featureIds: number[];
  styleTags: string[];
  thumbnail: string | null;
  gallery: string[];
  reviewSummary: PopupReviewSummary;
  createdAt: string | null;
  updatedAt: string | null;
}
