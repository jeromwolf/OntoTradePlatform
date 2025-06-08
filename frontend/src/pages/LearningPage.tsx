/**
 * 학습 센터 페이지 - 완전한 교육 콘텐츠 시스템
 * 주석 시작 부분
 */

import React, { useState } from "react";
import MainLayout from "../components/Layout/MainLayout";
import { Card, StyledButton, PageHeader } from "../components/Common";
import theme from "../styles/theme";

const LearningPage: React.FC = () => {
  const [language, setLanguage] = useState<"ko" | "en">("ko");
  const [activeCategory, setActiveCategory] = useState("all");
  const [userProgress] = useState<{ [key: number]: number }>({
    1: 85,
    2: 60,
    3: 30,
    4: 100,
    5: 15,
  });
  const [quizMode, setQuizMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // 학습 통계
  const [learningStats] = useState({
    totalHours: 42.5,
    completedCourses: 3,
    currentStreak: 7,
    achievementPoints: 1250,
  });

  const categories = [
    { id: "all", name: "전체", nameEn: "All", icon: "📚" },
    { id: "basics", name: "기초", nameEn: "Basics", icon: "🎯" },
    { id: "technical", name: "기술분석", nameEn: "Technical", icon: "📈" },
    { id: "ontology", name: "온톨로지", nameEn: "Ontology", icon: "🕸️" },
    { id: "strategy", name: "전략", nameEn: "Strategy", icon: "⚡" },
    { id: "risk", name: "리스크관리", nameEn: "Risk Management", icon: "🛡️" },
  ];

  const courses = [
    {
      id: 1,
      title: "투자 기초 완전 정복",
      titleEn: "Complete Investment Basics",
      description: "주식 투자의 모든 기본 개념을 체계적으로 학습",
      descriptionEn: "Systematically learn all basic concepts of stock investment",
      category: "basics",
      level: "beginner",
      duration: "3.5시간",
      lessons: 12,
      icon: "📚",
      instructor: "김투자",
      rating: 4.9,
      students: 1247,
      thumbnail: "🎥",
      price: 0,
      tags: ["기초", "필수", "인기"],
    },
    {
      id: 2,
      title: "차트 분석 마스터",
      titleEn: "Chart Analysis Master",
      description: "기술적 분석의 핵심 도구와 패턴 분석 완전 정복",
      descriptionEn: "Master technical analysis tools and pattern recognition",
      category: "technical",
      level: "intermediate",
      duration: "6시간",
      lessons: 18,
      icon: "📈",
      instructor: "박분석",
      rating: 4.8,
      students: 892,
      thumbnail: "📊",
      price: 49000,
      tags: ["차트", "패턴", "실전"],
    },
    {
      id: 3,
      title: "온톨로지 투자 혁명",
      titleEn: "Ontology Investment Revolution",
      description: "차세대 투자 분석법인 온톨로지 기법의 모든 것",
      descriptionEn: "Everything about ontology techniques for next-gen investment analysis",
      category: "ontology",
      level: "advanced",
      duration: "4.5시간",
      lessons: 15,
      icon: "🕸️",
      instructor: "이온톨로지",
      rating: 4.7,
      students: 324,
      thumbnail: "🔬",
      price: 99000,
      tags: ["혁신", "고급", "독점"],
    },
    {
      id: 4,
      title: "포트폴리오 최적화",
      titleEn: "Portfolio Optimization",
      description: "효율적 포트폴리오 구성과 리밸런싱 전략",
      descriptionEn: "Efficient portfolio construction and rebalancing strategies",
      category: "strategy",
      level: "intermediate",
      duration: "5시간",
      lessons: 16,
      icon: "💼",
      instructor: "최포트폴리오",
      rating: 4.6,
      students: 567,
      thumbnail: "📈",
      price: 69000,
      tags: ["포트폴리오", "분산투자", "전략"],
    },
    {
      id: 5,
      title: "리스크 관리의 모든 것",
      titleEn: "Complete Risk Management",
      description: "손실 최소화와 수익 극대화를 위한 리스크 관리",
      descriptionEn: "Risk management for minimizing losses and maximizing profits",
      category: "risk",
      level: "advanced",
      duration: "4시간",
      lessons: 14,
      icon: "🛡️",
      instructor: "정리스크",
      rating: 4.8,
      students: 445,
      thumbnail: "⚠️",
      price: 79000,
      tags: ["리스크", "손절", "고급"],
    },
  ];

  const achievements = [
    { id: 1, name: "첫 걸음", icon: "🎯", description: "첫 번째 레슨 완료", unlocked: true },
    { id: 2, name: "학습왕", icon: "👑", description: "7일 연속 학습", unlocked: true },
    { id: 3, name: "전문가", icon: "🎓", description: "고급 코스 완료", unlocked: false },
    { id: 4, name: "퀴즈마스터", icon: "🧠", description: "퀴즈 100점 달성", unlocked: true },
    { id: 5, name: "완주자", icon: "🏃", description: "모든 코스 완료", unlocked: false },
  ];

  const quizQuestions = [
    {
      id: 1,
      question: "주식의 기본 가치를 평가하는 지표 중 하나는?",
      questionEn: "What is one of the indicators to evaluate the fundamental value of a stock?",
      options: ["PER", "RSI", "MACD", "볼린저밴드"],
      optionsEn: ["PER", "RSI", "MACD", "Bollinger Bands"],
      correctAnswer: 0,
      explanation: "PER(주가수익비율)은 주식의 기본 가치를 평가하는 대표적인 지표입니다.",
    },
  ];

  // 필터링된 코스 목록
  const filteredCourses = courses.filter(course => {
    const categoryMatch = activeCategory === "all" || course.category === activeCategory;
    const searchMatch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       course.titleEn.toLowerCase().includes(searchTerm.toLowerCase());
    return categoryMatch && searchMatch;
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case "beginner": return "bg-green-500";
      case "intermediate": return "bg-yellow-500";
      case "advanced": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getLevelText = (level: string) => {
    const levels = {
      beginner: language === "ko" ? "초급" : "Beginner",
      intermediate: language === "ko" ? "중급" : "Intermediate",
      advanced: language === "ko" ? "고급" : "Advanced"
    };
    return levels[level as keyof typeof levels] || level;
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <PageHeader
            title={`📚 ${language === "ko" ? "학습 센터" : "Learning Center"}`}
            subtitle={language === "ko"
              ? "전문적인 투자 교육과 실전 노하우"
              : "Professional investment education and practical know-how"}
          >
            <div className="flex gap-4">
              {/* 퀴즈 모드 토글 */}
              <StyledButton
                variant={quizMode ? "primary" : "secondary"}
                onClick={() => setQuizMode(!quizMode)}
              >
                🧠 {language === "ko" ? "퀴즈 모드" : "Quiz Mode"}
              </StyledButton>
              
              {/* 언어 선택 */}
              <div className="flex gap-1">
                <StyledButton
                  variant={language === "ko" ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setLanguage("ko")}
                >
                  🇰🇷 한국어
                </StyledButton>
                <StyledButton
                  variant={language === "en" ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setLanguage("en")}
                >
                  🇺🇸 English
                </StyledButton>
              </div>
            </div>
          </PageHeader>

          {/* 학습 통계 대시보드 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="text-center" gradient>
              <div 
                className="text-sm mb-1"
                style={{ color: theme.colors.text.muted }}
              >
                {language === "ko" ? "총 학습시간" : "Total Hours"}
              </div>
              <div 
                className="text-3xl font-bold"
                style={{ color: theme.colors.text.primary }}
              >
                {learningStats.totalHours}h
              </div>
              <div className="text-2xl mt-2">📚</div>
            </Card>
            
            <Card className="text-center" gradient>
              <div 
                className="text-sm mb-1"
                style={{ color: theme.colors.text.muted }}
              >
                {language === "ko" ? "완료 코스" : "Completed"}
              </div>
              <div 
                className="text-3xl font-bold"
                style={{ color: theme.colors.status.success }}
              >
                {learningStats.completedCourses}
              </div>
              <div className="text-2xl mt-2">✅</div>
            </Card>
            
            <Card className="text-center" gradient>
              <div 
                className="text-sm mb-1"
                style={{ color: theme.colors.text.muted }}
              >
                {language === "ko" ? "연속 학습" : "Streak"}
              </div>
              <div 
                className="text-3xl font-bold"
                style={{ color: theme.colors.status.warning }}
              >
                {learningStats.currentStreak}일
              </div>
              <div className="text-2xl mt-2">🔥</div>
            </Card>
            
            <Card className="text-center" gradient>
              <div 
                className="text-sm mb-1"
                style={{ color: theme.colors.text.muted }}
              >
                {language === "ko" ? "성취 점수" : "Achievement"}
              </div>
              <div 
                className="text-3xl font-bold"
                style={{ color: theme.colors.brand.accent }}
              >
                {learningStats.achievementPoints}
              </div>
              <div className="text-2xl mt-2">🏆</div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* 사이드바 */}
            <div className="lg:col-span-1">
              {/* 카테고리 필터 */}
              <Card className="mb-6">
                <h3 
                  className="text-lg font-semibold mb-4"
                  style={{ color: theme.colors.text.primary }}
                >
                  🎯 {language === "ko" ? "카테고리" : "Categories"}
                </h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <StyledButton
                      key={category.id}
                      variant={activeCategory === category.id ? "primary" : "secondary"}
                      onClick={() => setActiveCategory(category.id)}
                      className="w-full text-left"
                    >
                      <span className="mr-2">{category.icon}</span>
                      {language === "ko" ? category.name : category.nameEn}
                    </StyledButton>
                  ))}
                </div>
              </Card>

              {/* 성취 시스템 */}
              <Card>
                <h3 
                  className="text-lg font-semibold mb-4"
                  style={{ color: theme.colors.text.primary }}
                >
                  🏆 {language === "ko" ? "성취도" : "Achievements"}
                </h3>
                <div className="space-y-3">
                  {achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`p-3 rounded-lg ${
                        achievement.unlocked
                          ? "bg-yellow-500/20 border border-yellow-500/30"
                          : "bg-gray-700/50 border border-gray-600"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{achievement.icon}</span>
                        <span className={`font-medium ${
                          achievement.unlocked ? "text-yellow-400" : "text-gray-500"
                        }`}>
                          {achievement.name}
                        </span>
                      </div>
                      <div className={`text-sm ${
                        achievement.unlocked ? "text-gray-300" : "text-gray-500"
                      }`}>
                        {achievement.description}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* 메인 콘텐츠 */}
            <div className="lg:col-span-3">
              {/* 검색 및 필터 */}
              <Card className="mb-6">
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={language === "ko" ? "코스 검색..." : "Search courses..."}
                    className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                  <StyledButton variant="primary">
                    🔍 {language === "ko" ? "검색" : "Search"}
                  </StyledButton>
                </div>
              </Card>

              {quizMode ? (
                /* 퀴즈 모드 */
                <Card>
                  <h2 
                    className="text-2xl font-bold mb-6"
                    style={{ color: theme.colors.text.primary }}
                  >
                    🧠 {language === "ko" ? "투자 지식 퀴즈" : "Investment Knowledge Quiz"}
                  </h2>
                  <div className="bg-gray-700 rounded-lg p-6">
                    <div className="mb-4">
                      <span className="text-blue-400 text-sm">Question 1/10</span>
                    </div>
                    <h3 className="text-xl text-white mb-6">
                      {language === "ko" 
                        ? quizQuestions[0].question 
                        : quizQuestions[0].questionEn}
                    </h3>
                    <div className="space-y-3 mb-6">
                      {(language === "ko" 
                        ? quizQuestions[0].options 
                        : quizQuestions[0].optionsEn
                      ).map((option, index) => (
                        <StyledButton
                          key={index}
                          variant="secondary"
                          className="w-full text-left"
                        >
                          {String.fromCharCode(65 + index)}. {option}
                        </StyledButton>
                      ))}
                    </div>
                    <div className="flex justify-between">
                      <StyledButton variant="secondary">
                        {language === "ko" ? "이전" : "Previous"}
                      </StyledButton>
                      <StyledButton variant="primary">
                        {language === "ko" ? "다음" : "Next"}
                      </StyledButton>
                    </div>
                  </div>
                </Card>
              ) : (
                /* 코스 목록 */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredCourses.map((course) => (
                    <Card key={course.id} className="overflow-hidden hover:scale-[1.02] transition-transform cursor-pointer"
                          onClick={() => console.log('코스 클릭:', course.title)}>
                      {/* 코스 썸네일 */}
                      <div className="h-48 bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                        <div className="text-6xl">{course.thumbnail}</div>
                      </div>
                      
                      {/* 코스 정보 */}
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{course.icon}</span>
                            <div>
                              <span className={`px-2 py-1 rounded text-xs text-white ${getLevelColor(course.level)}`}>
                                {getLevelText(course.level)}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-yellow-400 text-sm">⭐ {course.rating}</div>
                            <div 
                              className="text-xs"
                              style={{ color: theme.colors.text.muted }}
                            >
                              {course.students} 명
                            </div>
                          </div>
                        </div>

                        <h3 
                          className="text-xl font-bold mb-2"
                          style={{ color: theme.colors.text.primary }}
                        >
                          {language === "ko" ? course.title : course.titleEn}
                        </h3>
                        
                        <p 
                          className="text-sm mb-4"
                          style={{ color: theme.colors.text.muted }}
                        >
                          {language === "ko" ? course.description : course.descriptionEn}
                        </p>

                        {/* 진행률 바 */}
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span style={{ color: theme.colors.text.muted }}>
                              {language === "ko" ? "진행률" : "Progress"}
                            </span>
                            <span style={{ color: theme.colors.brand.primary }}>
                              {userProgress[course.id] || 0}%
                            </span>
                          </div>
                          <div 
                            className="w-full rounded-full h-2"
                            style={{ backgroundColor: theme.colors.background.secondary }}
                          >
                            <div
                              className="h-2 rounded-full transition-all"
                              style={{ 
                                width: `${userProgress[course.id] || 0}%`,
                                backgroundColor: theme.colors.brand.primary
                              }}
                            ></div>
                          </div>
                        </div>

                        {/* 태그 */}
                        <div className="flex flex-wrap gap-1 mb-4">
                          {course.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 text-xs rounded"
                              style={{ 
                                backgroundColor: theme.colors.background.secondary,
                                color: theme.colors.text.muted
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* 코스 메타정보 */}
                        <div 
                          className="flex justify-between items-center text-sm mb-4"
                          style={{ color: theme.colors.text.muted }}
                        >
                          <span>📚 {course.lessons} 레슨</span>
                          <span>⏱️ {course.duration}</span>
                          <span>👨‍🏫 {course.instructor}</span>
                        </div>

                        {/* 액션 버튼 */}
                        <div className="flex gap-2 items-center">
                          <StyledButton
                            variant="primary"
                            className="flex-1"
                          >
                            {userProgress[course.id] > 0 
                              ? (language === "ko" ? "계속 학습" : "Continue") 
                              : (language === "ko" ? "시작하기" : "Start")
                            }
                          </StyledButton>
                          {course.price > 0 ? (
                            <div className="flex items-center text-green-400 font-bold">
                              ₩{course.price.toLocaleString()}
                            </div>
                          ) : (
                            <div className="flex items-center text-green-400 font-bold">
                              FREE
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default LearningPage;
