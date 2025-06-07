import React from "react";
import { cn } from "@/utils/cn";

// 리더보드 엔트리
interface LeaderboardEntryProps {
  rank: number;
  username: string;
  returnRate: string;
  trades: number;
  streak: string;
  points: number;
  isCurrentUser?: boolean;
  className?: string;
}

export const LeaderboardEntry: React.FC<LeaderboardEntryProps> = ({
  rank,
  username,
  returnRate,
  trades,
  streak,
  points,
  isCurrentUser = false,
  className,
}) => {
  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return rank <= 10 ? "🏆" : "📍";
    }
  };

  const isPositiveReturn = returnRate.startsWith("+");

  return (
    <div
      className={cn(
        "flex items-center justify-between p-3 rounded-lg border transition-colors",
        isCurrentUser
          ? "bg-blue-50 border-blue-200 shadow-sm"
          : "bg-white hover:bg-gray-50",
        className,
      )}
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 min-w-[80px]">
          <span className="text-lg">{getRankEmoji(rank)}</span>
          <span className="font-semibold">{rank}</span>
        </div>

        <div className="min-w-[120px]">
          <span
            className={cn(
              "font-medium",
              isCurrentUser ? "text-blue-700" : "text-gray-900",
            )}
          >
            {username}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-6 text-sm">
        <div
          className={cn(
            "font-semibold",
            isPositiveReturn ? "text-green-600" : "text-red-600",
          )}
        >
          {returnRate}
        </div>

        <div className="text-gray-600 w-12 text-center">{trades}</div>

        <div className="text-gray-600 w-16 text-center">{streak}</div>

        <div className="text-blue-600 font-medium w-20 text-right">
          {points.toLocaleString()}pt
        </div>
      </div>
    </div>
  );
};

// 리더보드 테이블
interface LeaderboardProps {
  entries: Array<{
    rank: number;
    username: string;
    returnRate: string;
    trades: number;
    streak: string;
    points: number;
    isCurrentUser?: boolean;
  }>;
  title?: string;
  className?: string;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  entries,
  title = "🏆 전체 순위 (이번 주)",
  className,
}) => {
  return (
    <div className={cn("bg-white rounded-lg p-6", className)}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">{title}</h2>

        <div className="flex gap-2">
          <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors">
            전체
          </button>
          <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
            친구
          </button>
          <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
            그룹
          </button>
        </div>
      </div>

      {/* 헤더 */}
      <div className="flex items-center justify-between p-3 border-b bg-gray-50 rounded-t-lg text-sm font-medium text-gray-600">
        <div className="flex items-center gap-4">
          <div className="min-w-[80px]">순위</div>
          <div className="min-w-[120px]">사용자명</div>
        </div>
        <div className="flex items-center gap-6">
          <div>수익률</div>
          <div className="w-12 text-center">거래수</div>
          <div className="w-16 text-center">연속승</div>
          <div className="w-20 text-right">포인트</div>
        </div>
      </div>

      {/* 엔트리들 */}
      <div className="space-y-1">
        {entries.map((entry, index) => (
          <LeaderboardEntry key={index} {...entry} />
        ))}
      </div>

      <div className="flex gap-3 mt-4">
        <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          나의 순위 변화 보기
        </button>
        <button className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
          친구 초대하기
        </button>
      </div>
    </div>
  );
};

// 경쟁 현황 카드
interface CompetitionStatusProps {
  currentRank: number;
  rankChange: number;
  bestRank: number;
  streakDays: number;
  totalPoints: number;
  className?: string;
}

export const CompetitionStatus: React.FC<CompetitionStatusProps> = ({
  currentRank,
  rankChange,
  bestRank,
  streakDays,
  totalPoints,
  className,
}) => {
  const isRankUp = rankChange > 0;

  return (
    <div className={cn("bg-white rounded-lg p-6", className)}>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        📊 나의 경쟁 현황
      </h3>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">이번 주 순위:</span>
          <span className="font-semibold">{currentRank}위 📍</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">지난 주 대비:</span>
          <span
            className={cn(
              "font-semibold flex items-center gap-1",
              isRankUp ? "text-green-600" : "text-red-600",
            )}
          >
            {isRankUp ? "▲" : "▼"}
            {Math.abs(rankChange)}위
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">🏆 최고 순위:</span>
          <span className="font-semibold">{bestRank}위</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">📈 연속 상승:</span>
          <span className="font-semibold">{streakDays}일</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">💰 총 획득 포인트:</span>
          <span className="font-semibold text-blue-600">
            {totalPoints.toLocaleString()}pt
          </span>
        </div>
      </div>
    </div>
  );
};

// 진행 중인 대회 카드
interface TournamentCardProps {
  title: string;
  emoji: string;
  timeLeft: string;
  participants: number;
  prize: string;
  joined?: boolean;
  className?: string;
}

export const TournamentCard: React.FC<TournamentCardProps> = ({
  title,
  emoji,
  timeLeft,
  participants,
  prize,
  joined = false,
  className,
}) => {
  return (
    <div
      className={cn(
        "bg-white rounded-lg p-4 border hover:shadow-md transition-shadow",
        className,
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{emoji}</span>
        <h3 className="font-semibold">{title}</h3>
      </div>

      <div className="space-y-2 text-sm text-gray-600 mb-4">
        <div>• 기간: {timeLeft}</div>
        <div>• 참가자: {participants.toLocaleString()}명</div>
        <div>• 상금: {prize}</div>
      </div>

      <button
        className={cn(
          "w-full px-4 py-2 rounded-md font-medium transition-colors",
          joined
            ? "bg-green-100 text-green-700 hover:bg-green-200"
            : "bg-blue-600 text-white hover:bg-blue-700",
        )}
      >
        {joined ? "참가 중" : "참가하기"}
      </button>
    </div>
  );
};
