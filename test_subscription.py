#!/usr/bin/env python3
"""
WebSocket 구독 및 실시간 데이터 테스트
"""

import socketio
import time

def test_subscription():
    """구독 기능 테스트"""
    print("🔗 Socket.IO 구독 테스트 시작...")
    
    sio = socketio.Client()
    received_data = []
    
    @sio.event
    def connect():
        print("✅ Socket.IO 연결 성공!")
        print(f"   Session ID: {sio.sid}")
        
        # 주식 구독 요청 (올바른 이벤트명 사용)
        print("📈 AAPL 주식 구독 요청...")
        sio.emit('subscribe', {'symbol': 'AAPL'})
        
        print("📈 MSFT 주식 구독 요청...")
        sio.emit('subscribe', {'symbol': 'MSFT'})
    
    @sio.event
    def disconnect():
        print("❌ Socket.IO 연결 해제됨")
    
    @sio.event
    def stock_data(data):
        """실시간 주식 데이터 수신"""
        received_data.append(data)
        symbol = data.get('symbol', 'Unknown')
        price = data.get('price', 'N/A')
        print(f"📊 [{symbol}] 실시간 데이터 #{len(received_data)}: 가격=${price}")
    
    @sio.event
    def subscription_confirmed(data):
        print(f"✅ 구독 확인: {data}")
    
    @sio.event
    def unsubscription_confirmed(data):
        print(f"❌ 구독 해제 확인: {data}")
    
    @sio.event
    def symbol_subscribed(data):
        print(f"✅ 종목 구독됨: {data}")
    
    @sio.event 
    def symbol_unsubscribed(data):
        print(f"❌ 종목 구독 해제됨: {data}")
    
    try:
        # 백엔드 서버에 연결
        print("🌐 localhost:8000에 연결 중...")
        sio.connect('http://localhost:8000')
        
        # 20초 동안 데이터 수신 대기
        print("⏰ 20초 동안 실시간 데이터 수신 대기...")
        time.sleep(20)
        
        print(f"\n📋 테스트 결과:")
        print(f"   - 총 수신된 데이터: {len(received_data)}개")
        print(f"   - 연결 상태: {'연결됨' if sio.connected else '연결 안됨'}")
        
        if len(received_data) > 0:
            print("✅ WebSocket 실시간 데이터 수신 성공!")
            print("   백엔드와 프론트엔드 연동이 정상입니다.")
        else:
            print("❌ 데이터 수신 실패!")
            print("   구독 이벤트나 자동 업데이트를 확인해주세요.")
            
    except Exception as e:
        print(f"🚨 연결 실패: {e}")
    finally:
        if sio.connected:
            sio.disconnect()

if __name__ == "__main__":
    test_subscription()
