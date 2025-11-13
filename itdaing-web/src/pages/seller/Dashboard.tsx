import React from "react";
import { SellerDashboard as SellerDashboardComponent } from "../../components/seller/SellerDashboard";
import { useAuth } from "../../context/AuthContext";

export default function SellerDashboardPage() {
  const { user } = useAuth();
  const sellerId = user?.id ?? 0;

  if (!sellerId) {
    return <div className="text-sm text-gray-500">판매자 정보를 불러오지 못했습니다.</div>;
  }

  return <SellerDashboardComponent sellerId={sellerId} />;
}

