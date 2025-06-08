# 포트폴리오 스키마 설정 가이드

OntoTradePlatform의 포트폴리오 관리 시스템을 위한 데이터베이스 스키마 설정 가이드입니다.

## 🚀 빠른 설정 방법

### 1단계: Supabase Dashboard에서 SQL 실행

1. **Supabase Dashboard 접속**
   - https://supabase.com/dashboard 로그인
   - OntoTradePlatform 프로젝트 선택

2. **SQL Editor 열기**
   - 왼쪽 메뉴에서 "SQL Editor" 클릭
   - "New query" 버튼 클릭

3. **포트폴리오 스키마 SQL 실행**
   - 아래 SQL을 복사해서 SQL Editor에 붙여넣기
   - "Run" 버튼 클릭하여 실행

```sql
-- OntoTradePlatform 포트폴리오 스키마
-- 1. portfolios 테이블 (포트폴리오 기본 정보)
CREATE TABLE IF NOT EXISTS portfolios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    strategy VARCHAR(100),
    risk_level INTEGER CHECK (risk_level >= 1 AND risk_level <= 10) DEFAULT 5,
    total_value DECIMAL(15,2) DEFAULT 0.00,
    available_cash DECIMAL(15,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- 2. portfolio_holdings 테이블 (포트폴리오 보유 종목)
CREATE TABLE IF NOT EXISTS portfolio_holdings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL,
    quantity DECIMAL(15,6) NOT NULL DEFAULT 0,
    average_price DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    current_price DECIMAL(15,2) DEFAULT 0.00,
    total_value DECIMAL(15,2) DEFAULT 0.00,
    unrealized_pnl DECIMAL(15,2) DEFAULT 0.00,
    unrealized_pnl_percentage DECIMAL(8,4) DEFAULT 0.00,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(portfolio_id, symbol)
);

-- 3. transactions 테이블 (거래 내역)
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL,
    transaction_type VARCHAR(10) NOT NULL CHECK (transaction_type IN ('buy', 'sell')),
    quantity DECIMAL(15,6) NOT NULL,
    price DECIMAL(15,2) NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    fee DECIMAL(15,2) DEFAULT 0.00,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. portfolio_performance 테이블 (성과 데이터)
CREATE TABLE IF NOT EXISTS portfolio_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_value DECIMAL(15,2) NOT NULL,
    cash_value DECIMAL(15,2) NOT NULL,
    holdings_value DECIMAL(15,2) NOT NULL,
    daily_return DECIMAL(8,4) DEFAULT 0.00,
    cumulative_return DECIMAL(8,4) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(portfolio_id, date)
);

-- 5. portfolio_settings 테이블 (포트폴리오 설정)
CREATE TABLE IF NOT EXISTS portfolio_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE UNIQUE,
    auto_rebalance BOOLEAN DEFAULT FALSE,
    stop_loss_percentage DECIMAL(5,2),
    take_profit_percentage DECIMAL(5,2),
    max_position_size_percentage DECIMAL(5,2) DEFAULT 20.00,
    preferred_order_type VARCHAR(20) DEFAULT 'market',
    notifications_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_created_at ON portfolios(created_at);
CREATE INDEX IF NOT EXISTS idx_portfolio_holdings_portfolio_id ON portfolio_holdings(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_holdings_symbol ON portfolio_holdings(symbol);
CREATE INDEX IF NOT EXISTS idx_transactions_portfolio_id ON transactions(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_transactions_symbol ON transactions(symbol);
CREATE INDEX IF NOT EXISTS idx_transactions_executed_at ON transactions(executed_at);
CREATE INDEX IF NOT EXISTS idx_portfolio_performance_portfolio_id ON portfolio_performance(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_performance_date ON portfolio_performance(date);

-- RLS (Row Level Security) 정책 활성화
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_settings ENABLE ROW LEVEL SECURITY;

-- RLS 정책 생성: 사용자는自己的 포트폴리오만 접근 가능
DROP POLICY IF EXISTS "Users can view own portfolios" ON portfolios;
CREATE POLICY "Users can view own portfolios" ON portfolios
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own portfolios" ON portfolios;
CREATE POLICY "Users can insert own portfolios" ON portfolios
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own portfolios" ON portfolios;
CREATE POLICY "Users can update own portfolios" ON portfolios
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own portfolios" ON portfolios;
CREATE POLICY "Users can delete own portfolios" ON portfolios
    FOR DELETE USING (auth.uid() = user_id);

-- portfolio_holdings RLS 정책
DROP POLICY IF EXISTS "Users can view own portfolio holdings" ON portfolio_holdings;
CREATE POLICY "Users can view own portfolio holdings" ON portfolio_holdings
    FOR SELECT USING (auth.uid() = (SELECT user_id FROM portfolios WHERE id = portfolio_id));

DROP POLICY IF EXISTS "Users can insert own portfolio holdings" ON portfolio_holdings;
CREATE POLICY "Users can insert own portfolio holdings" ON portfolio_holdings
    FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM portfolios WHERE id = portfolio_id));

DROP POLICY IF EXISTS "Users can update own portfolio holdings" ON portfolio_holdings;
CREATE POLICY "Users can update own portfolio holdings" ON portfolio_holdings
    FOR UPDATE USING (auth.uid() = (SELECT user_id FROM portfolios WHERE id = portfolio_id));

DROP POLICY IF EXISTS "Users can delete own portfolio holdings" ON portfolio_holdings;
CREATE POLICY "Users can delete own portfolio holdings" ON portfolio_holdings
    FOR DELETE USING (auth.uid() = (SELECT user_id FROM portfolios WHERE id = portfolio_id));

-- transactions RLS 정책
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
CREATE POLICY "Users can view own transactions" ON transactions
    FOR SELECT USING (auth.uid() = (SELECT user_id FROM portfolios WHERE id = portfolio_id));

DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
CREATE POLICY "Users can insert own transactions" ON transactions
    FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM portfolios WHERE id = portfolio_id));

-- portfolio_performance RLS 정책
DROP POLICY IF EXISTS "Users can view own portfolio performance" ON portfolio_performance;
CREATE POLICY "Users can view own portfolio performance" ON portfolio_performance
    FOR SELECT USING (auth.uid() = (SELECT user_id FROM portfolios WHERE id = portfolio_id));

DROP POLICY IF EXISTS "Users can insert own portfolio performance" ON portfolio_performance;
CREATE POLICY "Users can insert own portfolio performance" ON portfolio_performance
    FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM portfolios WHERE id = portfolio_id));

-- portfolio_settings RLS 정책
DROP POLICY IF EXISTS "Users can view own portfolio settings" ON portfolio_settings;
CREATE POLICY "Users can view own portfolio settings" ON portfolio_settings
    FOR SELECT USING (auth.uid() = (SELECT user_id FROM portfolios WHERE id = portfolio_id));

DROP POLICY IF EXISTS "Users can insert own portfolio settings" ON portfolio_settings;
CREATE POLICY "Users can insert own portfolio settings" ON portfolio_settings
    FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM portfolios WHERE id = portfolio_id));

DROP POLICY IF EXISTS "Users can update own portfolio settings" ON portfolio_settings;
CREATE POLICY "Users can update own portfolio settings" ON portfolio_settings
    FOR UPDATE USING (auth.uid() = (SELECT user_id FROM portfolios WHERE id = portfolio_id));

-- 트리거 함수: updated_at 자동 갱신
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거: portfolios와 portfolio_settings 테이블에 updated_at 자동 갱신 적용
DROP TRIGGER IF EXISTS update_portfolios_updated_at ON portfolios;
CREATE TRIGGER update_portfolios_updated_at 
    BEFORE UPDATE ON portfolios 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_portfolio_settings_updated_at ON portfolio_settings;
CREATE TRIGGER update_portfolio_settings_updated_at 
    BEFORE UPDATE ON portfolio_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 함수: 포트폴리오 생성 시 기본 설정 자동 생성
CREATE OR REPLACE FUNCTION create_default_portfolio_settings()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO portfolio_settings (portfolio_id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거: 포트폴리오 생성 시 기본 설정 자동 생성
DROP TRIGGER IF EXISTS create_portfolio_settings_trigger ON portfolios;
CREATE TRIGGER create_portfolio_settings_trigger
    AFTER INSERT ON portfolios
    FOR EACH ROW EXECUTE FUNCTION create_default_portfolio_settings();
```

### 2단계: 백엔드 서버 시작

스키마 설정이 완료되면 백엔드 서버를 시작할 수 있습니다:

```bash
cd backend
uvicorn app.main:socket_app --host 0.0.0.0 --port 8000 --reload
```

## 📋 포함된 테이블

1. **portfolios** - 포트폴리오 기본 정보
2. **portfolio_holdings** - 포트폴리오 보유 종목
3. **transactions** - 거래 내역
4. **portfolio_performance** - 성과 데이터
5. **portfolio_settings** - 포트폴리오 설정

## 🔒 보안 설정

- **Row Level Security (RLS)** 활성화
- 사용자는 자신의 포트폴리오만 접근 가능
- 모든 테이블에 적절한 RLS 정책 적용

## 🚀 API 엔드포인트

스키마 설정 후 다음 API들을 사용할 수 있습니다:

- `GET /api/portfolios` - 포트폴리오 목록 조회
- `POST /api/portfolios` - 새 포트폴리오 생성
- `GET /api/portfolios/{id}` - 포트폴리오 상세 조회
- `PUT /api/portfolios/{id}` - 포트폴리오 수정
- `DELETE /api/portfolios/{id}` - 포트폴리오 삭제
- `POST /api/portfolios/{id}/holdings` - 보유 종목 추가
- `POST /api/portfolios/{id}/transactions` - 거래 기록
- `GET /api/portfolios/{id}/performance` - 성과 조회

## 🐛 문제 해결

### 테이블 생성 실패
- Supabase Dashboard > Table Editor에서 테이블 목록 확인
- SQL Editor에서 에러 메시지 확인
- RLS 정책이 올바르게 적용되었는지 확인

### API 접근 오류
- 사용자 인증이 올바르게 되었는지 확인
- JWT 토큰이 유효한지 확인
- RLS 정책이 사용자 ID와 일치하는지 확인

## 📞 지원

문제가 발생하면 Supabase Dashboard의 Logs 섹션에서 에러 로그를 확인하세요.
