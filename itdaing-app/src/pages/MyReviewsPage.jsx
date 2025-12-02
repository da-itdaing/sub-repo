import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import { ROUTES } from '@/routes/paths';
import apiClient from '@/api/client';

const MyReviewsPage = () => {
  const navigate = useNavigate();

  // API가 있다면: const { data } = useQuery(...)
  // 현재는 Mock 또는 빈 상태
  const reviews = []; 

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header hideSearchBar title="내 후기" />
      
      <main className="flex-1 w-full max-w-[540px] mx-auto px-5 pt-8 pb-10 md:pt-10">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-xl font-bold">작성한 후기</h1>
        </div>

        {reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Star className="w-8 h-8 text-gray-400 fill-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">아직 작성한 후기가 없어요</h3>
            <p className="text-sm text-gray-500 mt-1">
              방문한 팝업의 생생한 후기를 남겨보세요!
            </p>
            <button
              onClick={() => navigate(ROUTES.home)}
              className="mt-6 px-6 py-3 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition"
            >
              팝업 둘러보기
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* 후기 리스트 구현 예정 */}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default MyReviewsPage;

