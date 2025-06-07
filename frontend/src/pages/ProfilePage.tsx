import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  website?: string;
  bio?: string;
  updated_at?: string;
}

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    website: "",
    bio: "",
  });

  const getProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      if (!user) throw new Error("사용자가 로그인되지 않았습니다");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data) {
        setProfile(data);
        setFormData({
          full_name: data.full_name || "",
          website: data.website || "",
          bio: data.bio || "",
        });
      } else {
        // 프로필이 없으면 기본 프로필 생성
        const newProfile = {
          id: user.id,
          email: user.email || "",
          full_name: user.user_metadata?.full_name || "",
          avatar_url: user.user_metadata?.avatar_url || "",
          updated_at: new Date().toISOString(),
        };

        const { error: insertError } = await supabase
          .from("profiles")
          .insert([newProfile]);

        if (insertError) throw insertError;

        setProfile(newProfile);
        setFormData({
          full_name: newProfile.full_name || "",
          website: "",
          bio: "",
        });
      }
    } catch {
      setError("프로필을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      getProfile();
    }
  }, [user, getProfile]);

  const updateProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!user) throw new Error("사용자가 로그인되지 않았습니다");

      const updates = {
        id: user.id,
        full_name: formData.full_name,
        website: formData.website,
        bio: formData.bio,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("profiles").upsert(updates);

      if (error) throw error;

      setProfile((prev) => (prev ? { ...prev, ...updates } : null));
      setIsEditing(false);
    } catch {
      setError("프로필 업데이트에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      setError(null);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("파일을 선택해주세요.");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${user?.id}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user?.id);

      if (updateError) throw updateError;

      setProfile((prev) => (prev ? { ...prev, avatar_url: publicUrl } : null));
    } catch {
      setError("아바타 업로드에 실패했습니다.");
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            프로필을 찾을 수 없습니다
          </h2>
          <p className="text-gray-600">로그인 후 다시 시도해주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
        <div className="bg-white overflow-hidden shadow-xl sm:rounded-lg">
          {/* 헤더 */}
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  사용자 프로필
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  개인 정보 및 설정을 관리하세요.
                </p>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {isEditing ? "취소" : "수정"}
              </button>
            </div>
          </div>

          {/* 프로필 내용 */}
          <div className="px-4 py-5 sm:p-6">
            <div className="space-y-6">
              {/* 아바타 섹션 */}
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <img
                    className="h-24 w-24 rounded-full object-cover"
                    src={
                      profile.avatar_url ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name || profile.email)}&background=6366f1&color=fff`
                    }
                    alt="프로필 사진"
                  />
                  {isEditing && (
                    <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full cursor-pointer text-white text-xs font-medium">
                      {uploading ? "업로드..." : "변경"}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={uploadAvatar}
                        disabled={uploading}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <div>
                  <h4 className="text-lg font-medium text-gray-900">
                    {profile.full_name || "이름 없음"}
                  </h4>
                  <p className="text-sm text-gray-500">{profile.email}</p>
                  <p className="text-xs text-gray-400">
                    마지막 업데이트:{" "}
                    {profile.updated_at
                      ? new Date(profile.updated_at).toLocaleDateString("ko-KR")
                      : "정보 없음"}
                  </p>
                </div>
              </div>

              {/* 프로필 정보 */}
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    이름
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="이름을 입력하세요"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900">
                      {profile.full_name || "이름이 설정되지 않았습니다"}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    이메일
                  </label>
                  <p className="mt-1 text-sm text-gray-900">{profile.email}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    이메일은 변경할 수 없습니다
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    웹사이트
                  </label>
                  {isEditing ? (
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="https://example.com"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900">
                      {profile.website ? (
                        <a
                          href={profile.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-500"
                        >
                          {profile.website}
                        </a>
                      ) : (
                        "웹사이트가 설정되지 않았습니다"
                      )}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    자기소개
                  </label>
                  {isEditing ? (
                    <textarea
                      name="bio"
                      rows={4}
                      value={formData.bio}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="자기소개를 입력하세요"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                      {profile.bio || "자기소개가 설정되지 않았습니다"}
                    </p>
                  )}
                </div>
              </div>

              {/* 저장 버튼 */}
              {isEditing && (
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    취소
                  </button>
                  <button
                    onClick={updateProfile}
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {loading ? "저장 중..." : "저장"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
