#!/usr/bin/env python3
"""
관심종목 테이블 생성 스크립트
"""

import asyncio
import sys
import os
from dotenv import load_dotenv

# 환경 변수 로드
load_dotenv()

# 프로젝트 루트를 Python 경로에 추가
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import engine, Base
from app.models.watchlist import UserWatchlist, UserRecentStocks

async def create_tables():
    """관심종목 관련 테이블 생성"""
    try:
        print("관심종목 테이블 생성 중...")
        
        # 테이블 생성
        async with engine.begin() as conn:
            # 테이블이 존재하지 않을 때만 생성
            await conn.run_sync(Base.metadata.create_all)
        
        print("✅ 관심종목 테이블 생성 완료!")
        print("   - user_watchlists: 사용자 관심종목")
        print("   - user_recent_stocks: 사용자 최근 조회 종목")
        
    except Exception as e:
        print(f"❌ 테이블 생성 실패: {e}")
        return False
    
    return True

if __name__ == "__main__":
    # 비동기 실행
    success = asyncio.run(create_tables())
    if not success:
        sys.exit(1)
