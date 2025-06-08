/**
 * 학습 센터 페이지 - 와이어프레임 기반 구현
 */

import React, { useState } from 'react';
import MainLayout from '../components/Layout/MainLayout';

const LearningPage: React.FC = () => {
  const [language, setLanguage] = useState<'ko' | 'en'>('ko');

  const courses = [
    {
      id: 1,
      title: '투자 기초',
      titleEn: 'Investment Basics',
      description: '주식 투자의 기본 개념과 용어를 배워보세요',
      descriptionEn: 'Learn basic concepts and terminology of stock investment',
      level: 'beginner',
      duration: '2시간',
      icon: '📚'
    },
    {
      id: 2,
      title: '기술적 분석',
      titleEn: 'Technical Analysis',
      description: '차트 분석과 패턴 인식을 통한 투자 전략',
      descriptionEn: 'Investment strategies through chart analysis and pattern recognition',
      level: 'intermediate',
      duration: '4시간',
      icon: '📈'
    },
    {
      id: 3,
      title: '온톨로지 분석',
      titleEn: 'Ontology Analysis',
      description: 'OntoTrade만의 혁신적인 기업 관계 분석법',
      descriptionEn: 'OntoTrade\'s innovative corporate relationship analysis',
      level: 'advanced',
      duration: '3시간',
      icon: '🕸️'
    }
  ];

  const getLevelBadge = (level: string) => {
    const badges = {
      beginner: { 
        label: language === 'ko' ? '초급' : 'Beginner', 
        color: 'bg-green-500' 
      },
      intermediate: { 
        label: language === 'ko' ? '중급' : 'Intermediate', 
        color: 'bg-yellow-500' 
      },
      advanced: { 
        label: language === 'ko' ? '고급' : 'Advanced', 
        color: 'bg-red-500' 
      }
    };
    return badges[level as keyof typeof badges];
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-6xl mx-auto">
          {/* 언어 선택 */}
          <div className="flex justify-end mb-6">
            <div className="flex bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setLanguage('ko')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  language === 'ko' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                🇰🇷 한국어
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  language === 'en' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                🇺🇸 English
              </button>
            </div>
          </div>

          {/* 헤더 */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              📚 {language === 'ko' ? '학습 센터' : 'Learning Center'}
            </h1>
            <p className="text-xl text-gray-400">
              {language === 'ko' 
                ? '투자 전문가가 되는 여정을 시작하세요!' 
                : 'Start your journey to become an investment expert!'
              }
            </p>
          </div>

          {/* 코스 목록 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {courses.map((course) => {
              const badge = getLevelBadge(course.level);
              return (
                <div key={course.id} className="bg-gray-800 rounded-xl p-6 hover:bg-gray-700 transition-colors cursor-pointer">
                  <div className="text-4xl mb-4 text-center">{course.icon}</div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold text-white">
                      {language === 'ko' ? course.title : course.titleEn}
                    </h3>
                    <span className={`${badge.color} text-white text-xs px-2 py-1 rounded-full`}>
                      {badge.label}
                    </span>
                  </div>
                  
                  <p className="text-gray-400 mb-4">
                    {language === 'ko' ? course.description : course.descriptionEn}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      ⏱️ {course.duration}
                    </span>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded transition-colors">
                      {language === 'ko' ? '시작하기' : 'Start'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 학습 진행 상황 */}
          <div className="bg-gray-800 rounded-xl p-6 mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">
              🎯 {language === 'ko' ? '학습 진행 상황' : 'Learning Progress'}
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white">
                  {language === 'ko' ? '완료한 코스' : 'Completed Courses'}
                </span>
                <span className="text-gray-400">0 / 3</span>
              </div>
              
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full w-0"></div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">
                  {language === 'ko' ? '학습 시간' : 'Study Time'}
                </span>
                <span className="text-white">0시간</span>
              </div>
            </div>
          </div>

          {/* 구현 예정 메시지 */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">
              🚧 {language === 'ko' ? '더 많은 학습 콘텐츠가 곧 출시됩니다!' : 'More learning content coming soon!'}
            </h2>
            <p className="text-white/80">
              {language === 'ko' 
                ? '비디오 강의, 퀴즈, 실습 과제 등 다양한 학습 자료가 준비 중입니다.' 
                : 'Video lectures, quizzes, practical assignments and various learning materials are in development.'
              }
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default LearningPage;
