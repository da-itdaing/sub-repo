import React from "react";
import { Users, Shield, UserCheck, UserMinus } from "lucide-react";

const SAMPLE_USERS = [
  { id: 1001, name: "김소비", role: "CONSUMER", joinedAt: "2025-08-12", status: "ACTIVE" },
  { id: 2001, name: "플레이팩토리", role: "SELLER", joinedAt: "2025-05-03", status: "ACTIVE" },
  { id: 1, name: "운영자", role: "ADMIN", joinedAt: "2024-12-01", status: "ACTIVE" }
];

export default function AdminUserManagementPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-gray-900">사용자 관리</h1>
        <p className="text-sm text-gray-500 mt-1">소비자, 판매자, 관리자 계정을 관리하고 권한을 조정합니다.</p>
      </header>
      <section className="grid gap-4 md:grid-cols-3">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
          <Users className="size-5 text-[#2563eb]" />
          <p className="mt-2 text-sm text-gray-500">전체 사용자</p>
          <p className="text-2xl font-semibold">2,430</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
          <UserCheck className="size-5 text-[#16a34a]" />
          <p className="mt-2 text-sm text-gray-500">활성 판매자</p>
          <p className="text-2xl font-semibold">86</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
          <Shield className="size-5 text-[#ef4444]" />
          <p className="mt-2 text-sm text-gray-500">관리자 계정</p>
          <p className="text-2xl font-semibold">4</p>
        </div>
      </section>
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">최근 가입자</h2>
          <button className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-xs text-gray-600 hover:border-gray-400">
            <UserMinus className="size-4" />
            권한 변경
          </button>
        </div>
        <div className="divide-y divide-gray-100">
          {SAMPLE_USERS.map(user => (
            <article key={user.id} className="px-6 py-4 flex items-center justify-between text-sm text-gray-600">
              <div>
                <p className="font-semibold text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-400">가입일 {user.joinedAt}</p>
              </div>
              <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                {user.role}
              </span>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

