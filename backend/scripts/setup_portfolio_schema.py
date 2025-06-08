"""
포트폴리오 데이터베이스 스키마 설정 스크립트

Supabase 데이터베이스에 포트폴리오 관련 테이블과 정책을 생성합니다.
"""

import asyncio
import os
import sys
from pathlib import Path

# 프로젝트 루트 디렉토리를 Python 경로에 추가
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from app.core.supabase import supabase_client


def apply_schema():
    """포트폴리오 스키마를 Supabase에 적용합니다."""
    try:
        print("🚀 포트폴리오 스키마 적용 시작...")

        # SQL 스키마 파일 읽기
        schema_file_path = project_root / "database" / "portfolio_schema.sql"

        if not schema_file_path.exists():
            print(f"❌ 스키마 파일을 찾을 수 없습니다: {schema_file_path}")
            return False

        with open(schema_file_path, "r", encoding="utf-8") as f:
            schema_sql = f.read()

        print(f"📄 스키마 파일 읽기 완료: {len(schema_sql)} 문자")

        # Supabase RPC를 통해 SQL 실행
        # 스키마가 큰 경우 여러 부분으로 나누어 실행
        sql_statements = [
            stmt.strip() for stmt in schema_sql.split(";") if stmt.strip()
        ]

        print(f"📝 총 {len(sql_statements)}개의 SQL 문장 실행 예정...")

        success_count = 0
        for i, statement in enumerate(sql_statements):
            if not statement:
                continue

            try:
                # RPC 호출로 SQL 실행
                result = supabase_client.client.rpc(
                    "execute_sql", {"sql_query": statement}
                ).execute()
                success_count += 1
                print(f"✅ SQL 문장 {i+1}/{len(sql_statements)} 실행 완료")

            except Exception as stmt_error:
                # 개별 SQL 문장 오류는 경고로 처리 (이미 존재하는 테이블 등)
                print(f"⚠️ SQL 문장 {i+1} 실행 중 오류 (계속 진행): {stmt_error}")
                continue

        print(f"🎉 스키마 적용 완료! {success_count}/{len(sql_statements)}개 문장 성공")

        # 테이블 존재 확인
        return verify_tables()

    except Exception as e:
        print(f"❌ 스키마 적용 중 오류 발생: {e}")
        return False


def verify_tables():
    """생성된 테이블들이 존재하는지 확인합니다."""
    try:
        print("🔍 테이블 존재 확인 중...")

        expected_tables = [
            "portfolios",
            "portfolio_holdings",
            "portfolio_transactions",
            "portfolio_performance",
            "portfolio_settings",
        ]

        existing_tables = []

        for table_name in expected_tables:
            try:
                # 각 테이블에서 1개 레코드만 조회해서 테이블 존재 여부 확인
                result = (
                    supabase_client.client.table(table_name)
                    .select("*")
                    .limit(1)
                    .execute()
                )
                existing_tables.append(table_name)
                print(f"✅ {table_name} 테이블 확인됨")

            except Exception as table_error:
                print(f"❌ {table_name} 테이블 없음: {table_error}")

        if len(existing_tables) == len(expected_tables):
            print(
                f"🎉 모든 포트폴리오 테이블 생성 완료! ({len(existing_tables)}/{len(expected_tables)})"
            )
            return True
        else:
            print(
                f"⚠️ 일부 테이블만 생성됨: {len(existing_tables)}/{len(expected_tables)}"
            )
            print(f"생성된 테이블: {existing_tables}")
            return False

    except Exception as e:
        print(f"❌ 테이블 확인 중 오류: {e}")
        return False


if __name__ == "__main__":
    print("🚀 OntoTradePlatform 포트폴리오 스키마 설정")
    print("=" * 50)

    if apply_schema():
        print("\n✅ 포트폴리오 스키마 설정이 성공적으로 완료되었습니다!")
        print("🚀 이제 백엔드 서버를 실행할 수 있습니다.")
        print(
            "📝 실행 명령어: uvicorn app.main:socket_app --host 0.0.0.0 --port 8000 --reload"
        )
    else:
        print("\n❌ 포트폴리오 스키마 설정에 실패했습니다.")
        print("🔧 Supabase 연결과 권한을 확인해주세요.")
        print("📖 자세한 내용은 README_PORTFOLIO_SETUP.md를 참고하세요.")
        sys.exit(1)
