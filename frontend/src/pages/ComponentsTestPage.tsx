import React, { useState } from "react";
import {
  Button,
  Input,
  Checkbox,
  Radio,
  Textarea,
  Select,
  Label,
  Card,
  StatCard,
  GridContainer,
  SectionHeader,
  DashboardLayout,
  StockItem,
  OrderBook,
  TradingPanel,
  PositionCard,
  Leaderboard,
  CompetitionStatus,
  TournamentCard,
  Table,
  List,
  ListItem,
  DataList,
  SimpleList,
  Pagination,
  PageInfo,
  PageSizeSelect,
  ToastContainer,
  SuccessAlert,
  ErrorAlert,
  WarningAlert,
  InfoAlert,
  AlertAction,
  AlertActions,
  ProgressBar,
  CircularProgress,
  StepProgress,
  Spinner,
} from "@/components/ui";

const ComponentsTestPage: React.FC = () => {
  const [language, setLanguage] = useState<"ko" | "en">("ko");

  // 와이어프레임 기반 레이더보드 데이터
  const leaderboardData = [
    {
      rank: 1,
      username: "김투자왕",
      returnRate: "+15.2%",
      trades: 45,
      streak: "12일",
      points: 1250,
    },
    {
      rank: 2,
      username: "박수익러",
      returnRate: "+14.8%",
      trades: 32,
      streak: "8일",
      points: 1180,
    },
    {
      rank: 3,
      username: "이부자님",
      returnRate: "+13.5%",
      trades: 28,
      streak: "5일",
      points: 1120,
    },
    {
      rank: 127,
      username: "나 (투자자님)",
      returnRate: "+7.2%",
      trades: 18,
      streak: "2일",
      points: 650,
      isCurrentUser: true,
    },
    {
      rank: 128,
      username: "최초보",
      returnRate: "+6.8%",
      trades: 15,
      streak: "1일",
      points: 620,
    },
  ];

  // 사이드바 콘텐츠 (와이어프레임의 검색 및 종목 영역)
  const sidebarContent = (
    <div className="space-y-6">
      {/* 종목 검색 */}
      <div>
        <SectionHeader title="종목 검색" emoji="🔍" />
        <Input
          placeholder="종목명 또는 심볼 입력..."
          emoji="🔍"
          className="mb-4"
        />
      </div>

      {/* 인기 종목 */}
      <div>
        <SectionHeader title="인기 종목" emoji="📈" />
        <div className="space-y-2">
          <StockItem symbol="AAPL" price="$150.25" change="+2.5%" emoji="🍎" />
          <StockItem symbol="TSLA" price="$245.80" change="+1.8%" emoji="🚗" />
          <StockItem symbol="MSFT" price="$320.15" change="-0.5%" emoji="💻" />
          <StockItem symbol="GOOGL" price="$125.40" change="+3.2%" emoji="🔍" />
        </div>
      </div>

      {/* 섹터별 현황 */}
      <div>
        <SectionHeader title="섹터별 현황" emoji="📊" />
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>• 기술</span>
            <span className="text-green-600">+1.2%</span>
          </div>
          <div className="flex justify-between">
            <span>• 금융</span>
            <span className="text-red-600">-0.5%</span>
          </div>
          <div className="flex justify-between">
            <span>• 헬스케어</span>
            <span className="text-green-600">+0.8%</span>
          </div>
        </div>
      </div>

      {/* 내 포지션 */}
      <div>
        <SectionHeader title="내 포지션" emoji="💼" />
        <div className="space-y-2">
          <PositionCard
            symbol="AAPL"
            shares={50}
            currentValue="$7,512"
            change="+5.2%"
            emoji="🍎"
          />
          <PositionCard
            symbol="TSLA"
            shares={25}
            currentValue="$6,145"
            change="-2.1%"
            emoji="🚗"
          />
        </div>
        <div className="mt-3 p-2 bg-blue-50 rounded-lg">
          <div className="text-sm text-gray-600">총 평가액</div>
          <div className="text-lg font-semibold text-blue-600">$25,000</div>
        </div>
      </div>
    </div>
  );

  // 데이터 표시 컴포넌트 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 테이블용 샘플 데이터
  const tableColumns = [
    { key: "name" as const, header: "종목명", sortable: true },
    { key: "price" as const, header: "현재가", sortable: true },
    {
      key: "change" as const,
      header: "변동률",
      sortable: true,
      render: (value: number | string) => {
        const numValue = typeof value === "string" ? parseFloat(value) : value;
        return (
          <span
            className={
              numValue > 0
                ? "text-red-500"
                : numValue < 0
                  ? "text-blue-500"
                  : "text-gray-500"
            }
          >
            {numValue > 0 ? "+" : ""}
            {numValue.toFixed(2)}%
          </span>
        );
      },
    },
  ];

  const tableData = [
    { id: 1, name: "삼성전자", price: 68000, change: 2.3 },
    { id: 2, name: "SK하이닉스", price: 89000, change: -1.2 },
    { id: 3, name: "LG화학", price: 420000, change: 0.8 },
    { id: 4, name: "NAVER", price: 190000, change: -0.5 },
    { id: 5, name: "카카오", price: 85000, change: 1.7 },
  ];

  // 리스트용 샘플 데이터
  const newsItems = [
    "📈 삼성전자, 실적 개선으로 주가 상승세",
    "💰 비트코인, 5만 달러 돌파 임박",
    "🏭 반도체 업계, 공급부족 완화 기대감",
    "🌐 메타버스 관련주 동반 상승",
    "⚡ 전기차 배터리 기술 혁신 소식",
  ];

  const userRankings = [
    { rank: 1, name: "투자달인", profit: 34.5, trades: 127 },
    { rank: 2, name: "수익왕", profit: 28.3, trades: 89 },
    { rank: 3, name: "안정투자", profit: 22.1, trades: 156 },
    { rank: 4, name: "빠른손", profit: 19.8, trades: 203 },
    { rank: 5, name: "신중파", profit: 17.2, trades: 67 },
  ];

  const totalItems = 50;
  const totalPages = Math.ceil(totalItems / pageSize);

  const [toasts, setToasts] = useState<
    Array<{
      id: string;
      type: "success" | "error" | "warning" | "info";
      message: string;
    }>
  >([]);

  const addToast = (
    type: "success" | "error" | "warning" | "info",
    message: string,
  ) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);

    // 4초 후 자동 제거
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [showWarningAlert, setShowWarningAlert] = useState(false);
  const [showInfoAlert, setShowInfoAlert] = useState(false);

  const [progress, setProgress] = useState(50);
  const [circularProgress, setCircularProgress] = useState(75);
  const [steps, setSteps] = useState([
    { id: "1", title: "계정 생성", completed: true },
    { id: "2", title: "프로필 설정", completed: true },
    { id: "3", title: "이메일 인증", completed: false, current: true },
    { id: "4", title: "완료", completed: false },
  ]);

  return (
    <DashboardLayout sidebar={sidebarContent}>
      <div className="space-y-8">
        {/* 페이지 헤더 */}
        <div className="bg-white rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                ⚡ OntoTrade UI 컴포넌트
              </h1>
              <p className="text-gray-600 mt-2">
                와이어프레임 기반 React 컴포넌트 테스트 페이지
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={language === "ko" ? "primary" : "secondary"}
                size="sm"
                onClick={() => setLanguage("ko")}
              >
                🇰🇷 한국어
              </Button>
              <Button
                variant={language === "en" ? "primary" : "secondary"}
                size="sm"
                onClick={() => setLanguage("en")}
              >
                🇺🇸 English
              </Button>
            </div>
          </div>
        </div>

        {/* 실시간 거래 화면 (와이어프레임) */}
        <div>
          <SectionHeader title="실시간 거래" emoji="💹" />
          <GridContainer columns={2} className="gap-6">
            {/* 차트 영역 */}
            <Card className="col-span-1">
              <div className="h-64 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-700 mb-2">
                    AAPL $150.25 (+2.5%)
                  </div>
                  <div className="text-lg text-gray-500">
                    📈 실시간 가격 차트
                  </div>
                  <div className="text-sm text-gray-400 mt-2">
                    (5분/1시간/1일)
                  </div>
                </div>
              </div>
            </Card>

            {/* 호가창 & 거래 패널 */}
            <div className="grid grid-cols-2 gap-4">
              <TradingPanel />
              <OrderBook />
            </div>
          </GridContainer>
        </div>

        {/* 대시보드 통계 카드들 */}
        <div>
          <SectionHeader title="대시보드 통계" emoji="📊" />
          <GridContainer columns={4}>
            <StatCard
              icon="💰"
              value="$127,450"
              label="총 자산"
              change={{ value: "+12.5%", type: "up" }}
            />
            <StatCard
              icon="📈"
              value="$2,340"
              label="오늘 수익"
              change={{ value: "+1.8%", type: "up" }}
            />
            <StatCard
              icon="📊"
              value="156"
              label="거래 횟수"
              change={{ value: "+8", type: "up" }}
            />
            <StatCard
              icon="🎯"
              value="72.5%"
              label="승률"
              change={{ value: "-2.1%", type: "down" }}
            />
          </GridContainer>
        </div>

        {/* 리더보드 (와이어프레임) */}
        <div>
          <SectionHeader title="리더보드 & 경쟁" emoji="🏆" />
          <GridContainer columns={3} className="gap-6">
            <div className="col-span-2">
              <Leaderboard entries={leaderboardData} />
            </div>

            <div className="space-y-4">
              <CompetitionStatus
                currentRank={127}
                rankChange={-15}
                bestRank={45}
                streakDays={2}
                totalPoints={3250}
              />

              <TournamentCard
                title="주간 챌린지"
                emoji="🏃‍♂️"
                timeLeft="6일 남음"
                participants={2847}
                prize="10,000pt"
              />

              <TournamentCard
                title="기술주 토너먼트"
                emoji="🎮"
                timeLeft="3일 남음"
                participants={1256}
                prize="5,000pt"
                joined={true}
              />
            </div>
          </GridContainer>
        </div>

        {/* 기본 UI 컴포넌트들 */}
        <div>
          <SectionHeader title="기본 UI 컴포넌트" emoji="🧩" />
          <GridContainer columns={2}>
            {/* 버튼 컴포넌트들 */}
            <Card>
              <SectionHeader title="버튼 컴포넌트" emoji="🔘" />
              <div className="space-y-3">
                <div className="flex gap-2 flex-wrap">
                  <Button variant="primary" emoji="🚀">
                    기본 버튼
                  </Button>
                  <Button variant="secondary" emoji="📊">
                    보조 버튼
                  </Button>
                  <Button variant="outline" emoji="⚙️">
                    외곽선
                  </Button>
                  <Button variant="ghost" emoji="👻">
                    고스트
                  </Button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button size="sm" emoji="📱">
                    작은
                  </Button>
                  <Button size="md" emoji="💻">
                    중간
                  </Button>
                  <Button size="lg" emoji="🖥️">
                    큰
                  </Button>
                </div>
                <Button loading emoji="⏳">
                  로딩 버튼
                </Button>
              </div>
            </Card>

            {/* 입력 컴포넌트들 */}
            <Card>
              <SectionHeader title="입력 컴포넌트" emoji="📝" />
              <div className="space-y-4">
                <Input
                  label="사용자명"
                  placeholder="이름을 입력하세요"
                  emoji="👤"
                />
                <Input
                  label="이메일"
                  type="email"
                  placeholder="email@example.com"
                  emoji="📧"
                />
                <Input
                  label="비밀번호"
                  type="password"
                  placeholder="비밀번호를 입력하세요"
                  emoji="🔒"
                  error="비밀번호는 8자 이상이어야 합니다"
                />
              </div>
            </Card>
          </GridContainer>
        </div>

        {/* 새로운 폼 컴포넌트들 */}
        <div>
          <SectionHeader title="새로운 폼 컴포넌트" emoji="🆕" />
          <GridContainer columns={2}>
            {/* Checkbox & Radio */}
            <Card>
              <SectionHeader title="체크박스 & 라디오" emoji="☑️" />
              <div className="space-y-4">
                <Label emoji="🔗" required>
                  선호하는 거래 스타일
                </Label>
                <div className="space-y-2">
                  <Checkbox
                    label="단기 매매 (데이트레이딩)"
                    emoji="⚡"
                    description="하루 내 매매 완료"
                  />
                  <Checkbox
                    label="중기 투자 (스윙 트레이딩)"
                    emoji="📈"
                    description="몇 주~몇 달 보유"
                  />
                  <Checkbox
                    label="장기 투자 (홀딩)"
                    emoji="💎"
                    description="1년 이상 장기 보유"
                  />
                </div>

                <Label emoji="🎯" required>
                  위험 수용도
                </Label>
                <div className="space-y-2">
                  <Radio
                    name="risk"
                    label="안전 우선 (보수적)"
                    emoji="🛡️"
                    description="낮은 수익률, 낮은 위험"
                  />
                  <Radio
                    name="risk"
                    label="균형 잡힌 투자"
                    emoji="⚖️"
                    description="중간 수익률, 중간 위험"
                  />
                  <Radio
                    name="risk"
                    label="고수익 추구 (적극적)"
                    emoji="🚀"
                    description="높은 수익률, 높은 위험"
                  />
                </div>
              </div>
            </Card>

            {/* Select & Textarea */}
            <Card>
              <SectionHeader title="선택 & 텍스트 영역" emoji="📝" />
              <div className="space-y-4">
                <Select
                  label="투자 경험"
                  emoji="🎓"
                  placeholder="경험 수준을 선택하세요"
                  options={[
                    {
                      value: "beginner",
                      label: "초보자 (1년 미만)",
                      emoji: "🌱",
                    },
                    {
                      value: "intermediate",
                      label: "중급자 (1-3년)",
                      emoji: "📊",
                    },
                    {
                      value: "advanced",
                      label: "고급자 (3-10년)",
                      emoji: "💼",
                    },
                    {
                      value: "expert",
                      label: "전문가 (10년 이상)",
                      emoji: "🏆",
                    },
                  ]}
                />

                <Select
                  label="관심 시장"
                  emoji="🌍"
                  placeholder="시장을 선택하세요"
                  options={[
                    { value: "kospi", label: "한국 주식 (KOSPI)", emoji: "🇰🇷" },
                    {
                      value: "kosdaq",
                      label: "한국 주식 (KOSDAQ)",
                      emoji: "🚀",
                    },
                    {
                      value: "nasdaq",
                      label: "미국 주식 (NASDAQ)",
                      emoji: "🇺🇸",
                    },
                    { value: "crypto", label: "암호화폐", emoji: "₿" },
                    { value: "forex", label: "외환 (FX)", emoji: "💱" },
                  ]}
                />

                <Textarea
                  label="투자 목표"
                  emoji="🎯"
                  placeholder="투자 목표와 전략을 자유롭게 작성해주세요..."
                  rows={4}
                />
              </div>
            </Card>
          </GridContainer>
        </div>

        {/* 데이터 표시 컴포넌트 테스트 */}
        <Card className="p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">
            🗂️ 데이터 표시 컴포넌트
          </h2>

          {/* Table 컴포넌트 */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">📊 Table - 종목 현황</h3>
            <Table
              data={tableData}
              columns={tableColumns}
              onRowClick={(row) => alert(`${row.name} 클릭됨`)}
              className="w-full"
            />
          </div>

          {/* List 컴포넌트 */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">
                📰 Simple List - 오늘의 뉴스
              </h3>
              <SimpleList
                items={newsItems}
                onItemClick={(item, index) =>
                  alert(`뉴스 ${index + 1}: ${item}`)
                }
                className="max-h-60"
              />
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">
                🏆 Data List - 사용자 랭킹
              </h3>
              <DataList
                data={userRankings}
                keyExtractor={(item) => item.rank.toString()}
                renderItem={(user) => (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-lg">#{user.rank}</span>
                      <span className="font-medium">{user.name}</span>
                    </div>
                    <div className="text-right text-sm">
                      <div className="text-green-600 font-bold">
                        +{user.profit}%
                      </div>
                      <div className="text-gray-500">{user.trades}회 거래</div>
                    </div>
                  </div>
                )}
                onItemClick={(user) => alert(`${user.name} 프로필 보기`)}
                className="max-h-60"
              />
            </div>
          </div>

          {/* Custom List 구조 */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">
              🎛️ Custom List - 내 포지션
            </h3>
            <List bordered className="max-h-48">
              <ListItem active>
                <div className="flex justify-between">
                  <span>삼성전자 (005930)</span>
                  <span className="text-red-500">+5,000원 (+7.8%)</span>
                </div>
              </ListItem>
              <ListItem>
                <div className="flex justify-between">
                  <span>SK하이닉스 (000660)</span>
                  <span className="text-blue-500">-2,000원 (-2.2%)</span>
                </div>
              </ListItem>
              <ListItem disabled>
                <div className="flex justify-between">
                  <span>LG화학 (051910) - 매도 대기</span>
                  <span className="text-gray-500">+8,000원 (+1.9%)</span>
                </div>
              </ListItem>
            </List>
          </div>

          {/* Pagination 컴포넌트 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              📄 Pagination - 페이지 네비게이션
            </h3>

            {/* 페이지 정보 */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <PageInfo
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={pageSize}
              />
              <PageSizeSelect
                pageSize={pageSize}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setCurrentPage(1); // 페이지 크기 변경 시 첫 페이지로
                }}
                options={[5, 10, 20, 50]}
              />
            </div>

            {/* 메인 페이지네이션 */}
            <div className="flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(totalItems / pageSize)}
                onPageChange={setCurrentPage}
                maxVisiblePages={5}
              />
            </div>

            {/* 다양한 크기의 페이지네이션 */}
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  작은 크기 (sm)
                </h4>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  size="sm"
                  maxVisiblePages={3}
                />
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  큰 크기 (lg)
                </h4>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  size="lg"
                  showFirstLast={false}
                  maxVisiblePages={7}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* 피드백 및 알림 컴포넌트 테스트 */}
        <Card>
          <SectionHeader title="피드백 및 알림 컴포넌트" emoji="📣" />
          <div className="space-y-6">
            {/* Toast 알림 테스트 */}
            <div>
              <h4 className="text-lg font-medium mb-3">Toast 알림</h4>
              <div className="flex gap-2 flex-wrap">
                <Button
                  onClick={() =>
                    addToast("success", "성공적으로 처리되었습니다!")
                  }
                >
                  성공 알림
                </Button>
                <Button
                  onClick={() => addToast("error", "오류가 발생했습니다!")}
                >
                  오류 알림
                </Button>
                <Button
                  onClick={() => addToast("warning", "주의가 필요합니다!")}
                >
                  경고 알림
                </Button>
                <Button onClick={() => addToast("info", "정보를 확인하세요!")}>
                  정보 알림
                </Button>
              </div>

              {/* 토스트 컨테이너 */}
              <ToastContainer
                toasts={toasts.map((toast) => ({
                  id: toast.id,
                  type: toast.type,
                  message: toast.message,
                  duration: 4000,
                }))}
                onRemove={removeToast}
                position="top-right"
              />
            </div>

            {/* Alert 컴포넌트 테스트 */}
            <div>
              <h4 className="text-lg font-semibold mb-3">Alert 컴포넌트</h4>
              <div className="space-y-4">
                {showSuccessAlert && (
                  <SuccessAlert
                    title="성공!"
                    dismissible
                    onDismiss={() => setShowSuccessAlert(false)}
                    actions={
                      <AlertActions>
                        <AlertAction onClick={() => alert("확인됨")}>
                          확인
                        </AlertAction>
                        <AlertAction
                          variant="secondary"
                          onClick={() => setShowSuccessAlert(false)}
                        >
                          닫기
                        </AlertAction>
                      </AlertActions>
                    }
                  >
                    작업이 성공적으로 완료되었습니다.
                  </SuccessAlert>
                )}

                {showErrorAlert && (
                  <ErrorAlert
                    title="오류 발생"
                    dismissible
                    onDismiss={() => setShowErrorAlert(false)}
                  >
                    처리 중 오류가 발생했습니다. 다시 시도해주세요.
                  </ErrorAlert>
                )}

                {showWarningAlert && (
                  <WarningAlert
                    title="주의사항"
                    dismissible
                    onDismiss={() => setShowWarningAlert(false)}
                  >
                    이 작업은 되돌릴 수 없습니다. 계속하시겠습니까?
                  </WarningAlert>
                )}

                {showInfoAlert && (
                  <InfoAlert
                    title="정보"
                    dismissible
                    onDismiss={() => setShowInfoAlert(false)}
                  >
                    새로운 기능이 추가되었습니다. 확인해보세요!
                  </InfoAlert>
                )}

                <div className="flex gap-2 flex-wrap">
                  <Button onClick={() => setShowSuccessAlert(true)}>
                    성공 Alert 표시
                  </Button>
                  <Button onClick={() => setShowErrorAlert(true)}>
                    오류 Alert 표시
                  </Button>
                  <Button onClick={() => setShowWarningAlert(true)}>
                    경고 Alert 표시
                  </Button>
                  <Button onClick={() => setShowInfoAlert(true)}>
                    정보 Alert 표시
                  </Button>
                </div>
              </div>
            </div>

            {/* ProgressBar 테스트 */}
            <div>
              <h4 className="text-lg font-medium mb-3">진행률 표시기</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span>프로젝트 진행률</span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => setProgress(Math.max(0, progress - 10))}
                      >
                        -10%
                      </Button>
                      <Button
                        size="sm"
                        onClick={() =>
                          setProgress(Math.min(100, progress + 10))
                        }
                      >
                        +10%
                      </Button>
                    </div>
                  </div>
                  <ProgressBar
                    value={progress}
                    variant="success"
                    showLabel
                    label="프로젝트 완성도"
                    animated
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <ProgressBar
                    value={25}
                    variant="error"
                    size="sm"
                    label="오류율"
                  />
                  <ProgressBar
                    value={75}
                    variant="warning"
                    size="md"
                    label="경고사항"
                  />
                  <ProgressBar
                    value={90}
                    variant="info"
                    size="lg"
                    label="정보 완성도"
                  />
                </div>

                {/* 원형 진행률 */}
                <div className="flex items-center gap-4">
                  <CircularProgress
                    value={circularProgress}
                    size={80}
                    variant="success"
                  />
                  <div>
                    <p className="font-medium">CPU 사용률</p>
                    <div className="flex gap-2 mt-1">
                      <Button
                        size="sm"
                        onClick={() =>
                          setCircularProgress(
                            Math.max(0, circularProgress - 15),
                          )
                        }
                      >
                        -15%
                      </Button>
                      <Button
                        size="sm"
                        onClick={() =>
                          setCircularProgress(
                            Math.min(100, circularProgress + 15),
                          )
                        }
                      >
                        +15%
                      </Button>
                    </div>
                  </div>
                </div>

                {/* 단계별 진행률 */}
                <div>
                  <h5 className="font-medium mb-2">계정 설정 단계</h5>
                  <StepProgress steps={steps} variant="info" />
                  <div className="flex gap-2 mt-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        setSteps((prev) =>
                          prev.map((step, idx) =>
                            idx === 2
                              ? { ...step, completed: true, current: false }
                              : idx === 3
                                ? { ...step, current: true }
                                : step,
                          ),
                        );
                      }}
                    >
                      다음 단계
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSteps([
                          { id: "1", title: "계정 생성", completed: true },
                          { id: "2", title: "프로필 설정", completed: true },
                          {
                            id: "3",
                            title: "이메일 인증",
                            completed: false,
                            current: true,
                          },
                          { id: "4", title: "완료", completed: false },
                        ]);
                      }}
                    >
                      초기화
                    </Button>
                  </div>
                </div>

                {/* 스피너 */}
                <div>
                  <h5 className="font-medium mb-2">로딩 스피너</h5>
                  <div className="flex items-center gap-4">
                    <Spinner size="sm" variant="default" />
                    <Spinner size="md" variant="success" />
                    <Spinner size="lg" variant="error" />
                    <span className="text-sm text-gray-600">
                      다양한 크기와 색상
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* 접근성 및 언어 지원 */}
        <Card>
          <SectionHeader title="다국어 지원 예시" emoji="🌐" />
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">🇰🇷 한국어 UI</h3>
              <div className="space-y-2">
                <Button className="w-full" emoji="💰">
                  매수하기
                </Button>
                <Button variant="secondary" className="w-full" emoji="📊">
                  포트폴리오 보기
                </Button>
                <Button variant="outline" className="w-full" emoji="📈">
                  시장 분석
                </Button>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-3">🇺🇸 English UI</h3>
              <div className="space-y-2">
                <Button className="w-full" emoji="💰">
                  Buy Now
                </Button>
                <Button variant="secondary" className="w-full" emoji="📊">
                  View Portfolio
                </Button>
                <Button variant="outline" className="w-full" emoji="📈">
                  Market Analysis
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ComponentsTestPage;
