import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
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
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<"ko" | "en">("ko");
  const [formData, setFormData] = useState({
    full_name: "",
    website: "",
    bio: "",
  });

  const t = (ko: string, en: string) => (language === "ko" ? ko : en);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

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
      if (!user)
        throw new Error(
          t("사용자가 로그인되지 않았습니다", "User is not logged in"),
        );

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
      setError(
        t("프로필 업데이트에 실패했습니다.", "Failed to update profile."),
      );
    } finally {
      setLoading(false);
    }
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      setError(null);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error(t("파일을 선택해주세요.", "Please select a file."));
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
      setError(t("아바타 업로드에 실패했습니다.", "Failed to upload avatar."));
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

  if (loading && !profile) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0a0e27",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#e2e8f0",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "3px solid #1e293b",
              borderTop: "3px solid #3b82f6",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          ></div>
          <div>{t("프로필을 불러오는 중...", "Loading profile...")}</div>
        </div>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0a0e27",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#e2e8f0",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: "20px", marginBottom: "16px" }}>
            {t("프로필을 찾을 수 없습니다", "Profile not found")}
          </h2>
          <button
            onClick={() => navigate("/dashboard")}
            style={{
              padding: "12px 24px",
              background: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
            }}
          >
            {t("대시보드로 돌아가기", "Back to Dashboard")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0e27",
        color: "#e2e8f0",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* 헤더 */}
      <div
        style={{
          background: "#131629",
          borderBottom: "1px solid #1e293b",
          padding: "16px 24px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* 로고 및 네비게이션 */}
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <button
              onClick={() => navigate("/dashboard")}
              style={{
                color: "#3b82f6",
                fontSize: "20px",
                fontWeight: "bold",
                background: "transparent",
                border: "none",
                cursor: "pointer",
              }}
            >
              ⚡ OntoTrade
            </button>
            <div
              style={{
                color: "#64748b",
                fontSize: "14px",
              }}
            >
              👤 {t("프로필 관리", "Profile Management")}
            </div>
          </div>

          {/* 사용자 컨트롤 */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ display: "flex", gap: "4px" }}>
              <button
                onClick={() => setLanguage("ko")}
                style={{
                  padding: "6px 12px",
                  background: language === "ko" ? "#3b82f6" : "transparent",
                  color: language === "ko" ? "white" : "#64748b",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                🇰🇷 한국어
              </button>
              <button
                onClick={() => setLanguage("en")}
                style={{
                  padding: "6px 12px",
                  background: language === "en" ? "#3b82f6" : "transparent",
                  color: language === "en" ? "white" : "#64748b",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                🇺🇸 English
              </button>
            </div>
            <button
              onClick={handleLogout}
              style={{
                padding: "8px 16px",
                background: "#ef4444",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: "500",
                cursor: "pointer",
              }}
            >
              🚪 {t("로그아웃", "Logout")}
            </button>
          </div>
        </div>
      </div>

      {/* 프로필 내용 */}
      <div
        style={{
          padding: "24px",
        }}
      >
        {/* 에러 메시지 */}
        {error && (
          <div
            style={{
              background: "#ef4444",
              color: "white",
              padding: "12px",
              borderRadius: "6px",
              marginBottom: "16px",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          {/* 헤더 및 편집 버튼 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  marginBottom: "4px",
                }}
              >
                👤 {t("사용자 프로필", "User Profile")}
              </h1>
              <p
                style={{
                  fontSize: "14px",
                  color: "#64748b",
                }}
              >
                {t(
                  "개인 정보 및 설정을 관리하세요.",
                  "Manage your personal information and settings.",
                )}
              </p>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              style={{
                padding: "8px 16px",
                background: isEditing ? "#1e293b" : "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
              }}
            >
              ✏️ {isEditing ? t("취소", "Cancel") : t("수정", "Edit")}
            </button>
          </div>

          {/* 아바타 섹션 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div
              style={{
                position: "relative",
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                overflow: "hidden",
              }}
            >
              <img
                src={
                  profile.avatar_url ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name || profile.email)}&background=6366f1&color=fff`
                }
                alt="프로필 사진"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
              {isEditing && (
                <label
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(0, 0, 0, 0.5)",
                    color: "white",
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  {uploading ? "📤" : "📸"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={uploadAvatar}
                    disabled={uploading}
                    style={{ display: "none" }}
                  />
                </label>
              )}
            </div>
            <div>
              <h2
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  marginBottom: "4px",
                }}
              >
                {profile.full_name || t("이름 없음", "No Name")}
              </h2>
              <p
                style={{
                  fontSize: "14px",
                  color: "#64748b",
                }}
              >
                {profile.email}
              </p>
              <p
                style={{
                  fontSize: "12px",
                  color: "#64748b",
                }}
              >
                {t("마지막 업데이트:", "Last updated:")}{" "}
                {profile.updated_at
                  ? new Date(profile.updated_at).toLocaleDateString(
                      language === "ko" ? "ko-KR" : "en-US",
                    )
                  : t("정보 없음", "No data")}
              </p>
            </div>
          </div>

          {/* 프로필 정보 */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "bold",
                  marginBottom: "8px",
                  color: "#e2e8f0",
                }}
              >
                📝 {t("이름", "Name")}
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "#1e293b",
                    color: "#e2e8f0",
                    border: "1px solid #334155",
                    borderRadius: "6px",
                    fontSize: "14px",
                    outline: "none",
                  }}
                  placeholder={t("이름을 입력하세요", "Enter your name")}
                />
              ) : (
                <div
                  style={{
                    padding: "12px",
                    background: "#131629",
                    borderRadius: "6px",
                    fontSize: "14px",
                    color: "#e2e8f0",
                  }}
                >
                  {profile.full_name ||
                    t("이름이 설정되지 않았습니다", "Name not set")}
                </div>
              )}
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "bold",
                  marginBottom: "8px",
                  color: "#e2e8f0",
                }}
              >
                📧 {t("이메일", "Email")}
              </label>
              <div
                style={{
                  padding: "12px",
                  background: "#131629",
                  borderRadius: "6px",
                  fontSize: "14px",
                  color: "#e2e8f0",
                }}
              >
                {profile.email}
              </div>
              <p
                style={{
                  fontSize: "12px",
                  color: "#64748b",
                  marginTop: "4px",
                }}
              >
                💡 {t("이메일은 변경할 수 없습니다", "Email cannot be changed")}
              </p>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "bold",
                  marginBottom: "8px",
                  color: "#e2e8f0",
                }}
              >
                🌐 {t("웹사이트", "Website")}
              </label>
              {isEditing ? (
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "#1e293b",
                    color: "#e2e8f0",
                    border: "1px solid #334155",
                    borderRadius: "6px",
                    fontSize: "14px",
                    outline: "none",
                  }}
                  placeholder={t("https://example.com", "https://example.com")}
                />
              ) : (
                <div
                  style={{
                    padding: "12px",
                    background: "#131629",
                    borderRadius: "6px",
                    fontSize: "14px",
                    color: "#e2e8f0",
                  }}
                >
                  {profile.website ? (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "#3b82f6",
                        textDecoration: "none",
                      }}
                    >
                      🔗 {profile.website}
                    </a>
                  ) : (
                    t("웹사이트가 설정되지 않았습니다", "Website not set")
                  )}
                </div>
              )}
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "bold",
                  marginBottom: "8px",
                  color: "#e2e8f0",
                }}
              >
                💬 {t("자기소개", "Bio")}
              </label>
              {isEditing ? (
                <textarea
                  name="bio"
                  rows={4}
                  value={formData.bio}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "#1e293b",
                    color: "#e2e8f0",
                    border: "1px solid #334155",
                    borderRadius: "6px",
                    fontSize: "14px",
                    outline: "none",
                    resize: "vertical",
                  }}
                  placeholder={t("자기소개를 입력하세요", "Enter your bio")}
                />
              ) : (
                <div
                  style={{
                    padding: "12px",
                    background: "#131629",
                    borderRadius: "6px",
                    fontSize: "14px",
                    color: "#e2e8f0",
                    whiteSpace: "pre-wrap",
                    minHeight: "60px",
                  }}
                >
                  {profile.bio ||
                    t("자기소개가 설정되지 않았습니다", "Bio not set")}
                </div>
              )}
            </div>
          </div>

          {/* 저장 버튼 */}
          {isEditing && (
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
                paddingTop: "16px",
                borderTop: "1px solid #1e293b",
              }}
            >
              <button
                onClick={() => setIsEditing(false)}
                style={{
                  padding: "10px 20px",
                  background: "#475569",
                  color: "#e2e8f0",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: "pointer",
                }}
              >
                ❌ {t("취소", "Cancel")}
              </button>
              <button
                onClick={updateProfile}
                disabled={loading}
                style={{
                  padding: "10px 20px",
                  background: loading ? "#475569" : "#3b82f6",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "⏳" : "💾"}{" "}
                {loading ? t("저장 중...", "Saving...") : t("저장", "Save")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
