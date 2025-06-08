#!/usr/bin/env python3
"""
WebSocket 연결 테스트 클라이언트
백엔드 Socket.IO 서버가 정상 작동하는지 확인합니다.
"""

import socketio
import time
import asyncio

def test_websocket_connection():
    """Socket.IO 연결 테스트"""
    print("🔗 Socket.IO 클라이언트 테스트 시작...")

    # Socket.IO 클라이언트 생성
    sio = socketio.Client()
    received_data = []

    @sio.event
    def connect():
        print("✅ Socket.IO 연결 성공!")
        print(f"   Session ID: {sio.sid}")

        # 주식 구독 요청
        print("📈 AAPL 주식 구독 요청 중...")
        sio.emit('subscribe_stock', {'symbol': 'AAPL'})

    @sio.event
    def disconnect():
        print("❌ Socket.IO 연결 해제됨")

    @sio.event
    def connect_error(data):
        print(f"🚨 연결 오류: {data}")

    @sio.event
    def stock_data(data):
        """실시간 주식 데이터 수신"""
        received_data.append(data)
        print(f"📊 실시간 데이터 수신 #{len(received_data)}: {data}")

    @sio.event
    def subscription_confirmed(data):
        print(f"✅ 구독 확인: {data}")

    try:
        # 백엔드 서버에 연결
        print("🌐 localhost:8000에 연결 중...")
        sio.connect('http://localhost:8000')

        # 15초 동안 데이터 수신 대기
        print("⏰ 15초 동안 실시간 데이터 수신 대기...")
        time.sleep(15)

        print(f"\n📋 테스트 결과:")
        print(f"   - 총 수신된 데이터: {len(received_data)}개")
        print(f"   - 연결 상태: {'연결됨' if sio.connected else '연결 안됨'}")

        if len(received_data) > 0:
            print("✅ WebSocket 실시간 데이터 수신 성공!")
            print("   백엔드가 정상 작동 중입니다.")
        else:
            print("❌ 데이터 수신 실패!")
            print("   백엔드 설정을 확인해주세요.")

    except Exception as e:
        print(f"🚨 연결 실패: {e}")
    finally:
        if sio.connected:
            sio.disconnect()

if __name__ == "__main__":
    test_websocket_connection()
