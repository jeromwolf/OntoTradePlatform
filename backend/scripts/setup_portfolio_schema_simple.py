#!/usr/bin/env python3
"""
OntoTradePlatform 포트폴리오 스키마 설정 스크립트 (간단 버전)
Supabase 클라이언트를 사용해서 직접 스키마를 적용합니다.
"""

import os
import sys
from pathlib import Path

# 프로젝트 루트를 Python 경로에 추가
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from app.core.supabase import supabase_client


def apply_schema_simple():
    """포트폴리오 스키마를 간단하게 적용합니다."""
    print("🚀 OntoTradePlatform 포트폴리오 스키마 설정 (간단 버전)")
    print("=" * 60)

    try:
        print("🚀 Supabase 연결 테스트...")
        # 연결 테스트
        result = (
            supabase_client.client.table("profiles").select("id").limit(1).execute()
        )
        print("✅ Supabase 연결 성공")

        # 스키마 SQL 직접 정의 (핵심 테이블만)
        schema_sql = """
        -- 1. portfolios 테이블
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

        -- 2. portfolio_holdings 테이블
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

        -- 3. transactions 테이블
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

        -- RLS 활성화
        ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
        ALTER TABLE portfolio_holdings ENABLE ROW LEVEL SECURITY;
        ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
        """

        print("🚀 스키마 적용 중...")
        # Supabase SQL Editor와 동일한 방식으로 실행
        result = (
            supabase_client.client.postgrest.schema("public")
            .rpc("query", {"query": schema_sql})
            .execute()
        )

        print("✅ 기본 테이블 생성 완료")

        # RLS 정책 적용
        rls_policies = [
            """
            CREATE POLICY IF NOT EXISTS "Users can view own portfolios" ON portfolios
                FOR SELECT USING (auth.uid() = user_id);
            """,
            """
            CREATE POLICY IF NOT EXISTS "Users can insert own portfolios" ON portfolios
                FOR INSERT WITH CHECK (auth.uid() = user_id);
            """,
            """
            CREATE POLICY IF NOT EXISTS "Users can update own portfolios" ON portfolios
                FOR UPDATE USING (auth.uid() = user_id);
            """,
            """
            CREATE POLICY IF NOT EXISTS "Users can delete own portfolios" ON portfolios
                FOR DELETE USING (auth.uid() = user_id);
            """,
        ]

        print("🚀 RLS 정책 적용 중...")
        for i, policy in enumerate(rls_policies):
            try:
                result = (
                    supabase_client.client.postgrest.schema("public")
                    .rpc("query", {"query": policy})
                    .execute()
                )
                print(f"✅ RLS 정책 {i+1}/{len(rls_policies)} 적용 완료")
            except Exception as e:
                print(f"⚠️ RLS 정책 {i+1} 적용 실패: {e}")

        # 테이블 존재 확인
        print("🔍 테이블 생성 확인 중...")
        expected_tables = ["portfolios", "portfolio_holdings", "transactions"]
        existing_tables = []

        for table_name in expected_tables:
            try:
                result = (
                    supabase_client.client.table(table_name)
                    .select("*")
                    .limit(1)
                    .execute()
                )
                existing_tables.append(table_name)
                print(f"✅ {table_name} 테이블 확인됨")
            except Exception as e:
                print(f"❌ {table_name} 테이블 누락: {e}")

        print("\n" + "=" * 60)
        print("📊 포트폴리오 스키마 설정 완료")
        print(f"✅ 생성된 테이블: {len(existing_tables)}/{len(expected_tables)}")
        print(f"📋 테이블 목록: {', '.join(existing_tables)}")

        if len(existing_tables) == len(expected_tables):
            print("🎉 모든 포트폴리오 테이블이 성공적으로 생성되었습니다!")
            print("🚀 이제 백엔드 서버를 시작할 수 있습니다.")
        else:
            print("⚠️ 일부 테이블 생성에 실패했습니다.")
            print("🔧 Supabase Dashboard에서 수동으로 확인해주세요.")

        return True

    except Exception as e:
        print(f"❌ 포트폴리오 스키마 설정에 실패했습니다: {e}")
        print("🔧 Supabase 연결과 권한을 확인해주세요.")
        return False


if __name__ == "__main__":
    apply_schema_simple()
