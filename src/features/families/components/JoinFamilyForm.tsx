"use client";

import { useState } from "react";
import { joinFamily } from "@/features/families/actions";

interface JoinFamilyFormProps {
  onSuccess: () => void;
}

const roleOptions = [
  { value: "parent", label: "부모" },
  { value: "grandparent", label: "조부모" },
  { value: "sitter", label: "돌봄이" },
  { value: "other", label: "기타" },
];

const relationOptions = [
  { value: "mother", label: "엄마" },
  { value: "father", label: "아빠" },
  { value: "grandmother", label: "할머니" },
  { value: "grandfather", label: "할아버지" },
  { value: "nanny", label: "돌봄이" },
  { value: "other", label: "기타" },
];

export function JoinFamilyForm({ onSuccess }: JoinFamilyFormProps) {
  const [formData, setFormData] = useState({
    inviteCode: "",
    role: "parent",
    relation: "mother",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await joinFamily(
        formData.inviteCode,
        formData.role,
        formData.relation
      );

      if (result.success) {
        setFormData({ inviteCode: "", role: "parent", relation: "mother" });
        onSuccess();
      } else {
        setError(result.error || "가족 참여에 실패했습니다.");
      }
    } catch (err: any) {
      setError(err.message || "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg shadow-sm p-4 sm:p-6 space-y-4"
    >
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          초대 코드
        </label>
        <input
          type="text"
          name="inviteCode"
          value={formData.inviteCode}
          onChange={handleChange}
          placeholder="초대 코드를 입력하세요"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          required
        />
        <p className="mt-1 text-xs text-gray-500">
          가족원으로부터 받은 초대 코드를 입력하세요.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          역할
        </label>
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
        >
          {roleOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          아기와의 관계
        </label>
        <select
          name="relation"
          value={formData.relation}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
        >
          {relationOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-medium py-2 rounded-lg transition"
      >
        {loading ? "참여 중..." : "가족에 참여하기"}
      </button>
    </form>
  );
}
