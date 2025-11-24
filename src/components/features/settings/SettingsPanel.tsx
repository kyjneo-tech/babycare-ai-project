"use client";

import { useState, useEffect } from "react";
import {
  getCurrentUser,
  getUserSettings,
  updateUserSettings,
} from "@/features/settings/actions";

export function SettingsPanel() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const userResult = await getCurrentUser();
      if (!userResult.success) {
        setError(userResult.error || "사용자 정보를 확인할 수 없습니다.");
        return;
      }

      const userId = userResult.data?.userId;
      if (!userId) {
        setError("사용자 ID를 찾을 수 없습니다.");
        return;
      }

      setUserId(userId);
      const result = await getUserSettings(userId);
      if (result.success) {
        setSettings(result.data);
      } else {
        setError(result.error || "설정을 불러올 수 없습니다.");
      }
    } catch (err: any) {
      setError(err.message || "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const result = await updateUserSettings(userId, settings);
      if (result.success) {
        setSettings(result.data);
        setSuccess("설정이 저장되었습니다!");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(result.error || "설정 저장에 실패했습니다.");
      }
    } catch (err: any) {
      setError(err.message || "오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">설정을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 py-4 sm:px-6">
          <h1 className="text-2xl font-bold text-gray-900">⚙️ 설정</h1>
          <p className="mt-1 text-sm text-gray-600">
            앱 환경을 맞춤 설정하세요.
          </p>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-2xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        {settings && (
          <form onSubmit={handleSave} className="space-y-6">
            {/* 단위 설정 */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-2xl">📏</span>
                <h2 className="text-lg font-bold text-gray-900">단위 설정</h2>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  수유량 단위
                </label>
                <div className="space-y-2">
                  {["ml", "oz"].map((unit) => (
                    <label
                      key={unit}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="unit"
                        value={unit}
                        checked={settings.unit === unit}
                        onChange={(e) =>
                          setSettings({ ...settings, unit: e.target.value })
                        }
                        className="w-4 h-4"
                      />
                      <span className="text-gray-700">
                        {unit === "ml" ? "밀리리터 (ml)" : "온스 (oz)"}
                      </span>
                    </label>
                  ))}
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  수유량을 기록할 때 사용할 단위를 선택하세요.
                </p>
              </div>
            </div>

            {/* 시간 형식 설정 */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-2xl">⏰</span>
                <h2 className="text-lg font-bold text-gray-900">시간 형식</h2>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  시간 표시 방식
                </label>
                <div className="space-y-2">
                  {[
                    { value: "24h", label: "24시간 (09:30)" },
                    { value: "12h", label: "12시간 (9:30 AM)" },
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="timeFormat"
                        value={opt.value}
                        checked={settings.timeFormat === opt.value}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            timeFormat: e.target.value,
                          })
                        }
                        className="w-4 h-4"
                      />
                      <span className="text-gray-700">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* 알림 설정 */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-2xl">🔔</span>
                <h2 className="text-lg font-bold text-gray-900">알림 설정</h2>
              </div>
              <div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notificationsEnabled}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        notificationsEnabled: e.target.checked,
                      })
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-gray-700 font-medium">알림 활성화</span>
                </label>
                <p className="mt-2 text-xs text-gray-500">
                  수유, 수면, 배변 등의 기록 알림을 받을지 선택하세요.
                </p>
              </div>

              {settings.notificationsEnabled && (
                <div className="mt-4 pt-4 border-t space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      수유 알림 간격 (분)
                    </label>
                    <input
                      type="number"
                      placeholder="120"
                      min="0"
                      step="30"
                      defaultValue="120"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      수면 알림 간격 (분)
                    </label>
                    <input
                      type="number"
                      placeholder="180"
                      min="0"
                      step="30"
                      defaultValue="180"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 저장 버튼 */}
            <div className="flex flex-col-reverse sm:flex-row sm:space-x-3">
              <button
                type="button"
                onClick={loadSettings}
                className="mt-2 sm:mt-0 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg font-medium transition"
              >
                {saving ? "저장 중..." : "저장하기"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
