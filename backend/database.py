from models import db, Application
import os


def init_db(app):
    """데이터베이스 초기화"""
    with app.app_context():
        # 데이터베이스 디렉토리 생성
        db_dir = os.path.dirname(os.path.abspath(__file__)) + '/../database'
        os.makedirs(db_dir, exist_ok=True)
        
        # 테이블 생성
        db.create_all()
        print("✓ 데이터베이스 초기화 완료")


def reset_db(app):
    """데이터베이스 리셋 (개발용)"""
    with app.app_context():
        db.drop_all()
        db.create_all()
        print("✓ 데이터베이스 리셋 완료")