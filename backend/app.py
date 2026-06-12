import os
from flask import Flask, render_template
from config import config
from models import db
from routes import api
from database import init_db

def create_app(config_name='development'):
    """Flask 애플리케이션 팩토리"""
    app = Flask(__name__, 
                template_folder='../frontend', 
                static_folder='../frontend')
    
    # 설정 로드
    app.config.from_object(config[config_name])
    
    # 데이터베이스 초기화
    db.init_app(app)
    
    # 데이터베이스 테이블 생성
    with app.app_context():
        db.create_all()
    
    # API 블루프린트 등록
    app.register_blueprint(api)
    
    # ============ 정적 페이지 라우트 ============
    
    @app.route('/')
    def index():
        """메인 페이지"""
        return render_template('index.html')
    
    @app.route('/apply')
    def apply():
        """가입 신청 페이지"""
        return render_template('apply.html')
    
    @app.route('/complete')
    def complete():
        """신청 완료 페이지"""
        return render_template('complete.html')
    
    @app.route('/admin')
    def admin():
        """운영진 관리 페이지"""
        return render_template('admin.html')
    
    # ============ 에러 핸들러 ============
    
    @app.errorhandler(404)
    def not_found(error):
        return {'error': '페이지를 찾을 수 없습니다.'}, 404
    
    @app.errorhandler(500)
    def server_error(error):
        return {'error': '서버 오류가 발생했습니다.'}, 500
    
    return app


if __name__ == '__main__':
    app = create_app('development')
    print("🚀 Aetherix E-sports 길드 가입 신청 홈페이지 시작!")
    print("📍 http://localhost:5000")
    app.run(debug=True, port=5000)