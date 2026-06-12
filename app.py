from flask import Flask, render_template, request, jsonify, session, redirect, url_for
import sqlite3
import os
from datetime import datetime
from functools import wraps

app = Flask(__name__)
app.secret_key = 'aetherix-secret-key-2026'

# 데이터베이스 설정
DATABASE = 'database.db'

def get_db():
    """데이터베이스 연결"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """데이터베이스 초기화"""
    if not os.path.exists(DATABASE):
        conn = get_db()
        c = conn.cursor()
        
        # 신청자 테이블 생성
        c.execute('''
            CREATE TABLE IF NOT EXISTS applications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nickname TEXT NOT NULL,
                discord_id TEXT NOT NULL,
                age INTEGER,
                tier TEXT NOT NULL,
                champions_score TEXT NOT NULL,
                position TEXT NOT NULL,
                play_time TEXT NOT NULL,
                introduction TEXT NOT NULL,
                status TEXT DEFAULT '대기',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()
        conn.close()

def login_required(f):
    """로그인 확인 데코레이터"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'admin_logged_in' not in session:
            return redirect(url_for('admin_login'))
        return f(*args, **kwargs)
    return decorated_function

# ==================== 메인 페이지 ====================

@app.route('/')
def index():
    """메인 페이지"""
    return render_template('index.html')

# ==================== 신청 페이지 ====================

@app.route('/apply')
def apply():
    """신청 페이지"""
    return render_template('apply.html')

@app.route('/api/apply', methods=['POST'])
def api_apply():
    """신청서 제출 API"""
    try:
        data = request.json
        
        # 필수 필드 검증
        required_fields = ['nickname', 'discord_id', 'tier', 'champions_score', 'position', 'play_time', 'introduction']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'success': False, 'message': f'{field}는 필수 항목입니다.'}), 400
        
        conn = get_db()
        c = conn.cursor()
        
        c.execute('''
            INSERT INTO applications (nickname, discord_id, age, tier, champions_score, position, play_time, introduction)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            data['nickname'],
            data['discord_id'],
            data.get('age') or None,
            data['tier'],
            data['champions_score'],
            data['position'],
            data['play_time'],
            data['introduction']
        ))
        
        conn.commit()
        conn.close()
        
        return jsonify({'success': True, 'message': '신청이 정상적으로 접수되었습니다.'})
    
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/complete')
def complete():
    """신청 완료 페이지"""
    return render_template('complete.html')

# ==================== 관리자 페이지 ====================

@app.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    """관리자 로그인"""
    if request.method == 'POST':
        data = request.json
        username = data.get('username')
        password = data.get('password')
        
        # 간단한 인증 (실제로는 더 안전한 방식을 사용해야 함)
        if username == 'admin' and password == 'admin123':
            session['admin_logged_in'] = True
            return jsonify({'success': True})
        else:
            return jsonify({'success': False, 'message': '아이디 또는 비밀번호가 잘못되었습니다.'}), 401
    
    return render_template('admin_login.html')

@app.route('/admin')
@login_required
def admin_dashboard():
    """관리자 대시보드"""
    return render_template('admin.html')

@app.route('/api/applications', methods=['GET'])
@login_required
def get_applications():
    """지원자 목록 조회"""
    try:
        conn = get_db()
        c = conn.cursor()
        c.execute('SELECT * FROM applications ORDER BY created_at DESC')
        applications = [dict(row) for row in c.fetchall()]
        conn.close()
        
        return jsonify({'success': True, 'data': applications})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/applications/<int:app_id>/status', methods=['PUT'])
@login_required
def update_application_status(app_id):
    """지원자 상태 변경"""
    try:
        data = request.json
        new_status = data.get('status')
        
        if new_status not in ['대기', '승인', '거절']:
            return jsonify({'success': False, 'message': '유효하지 않은 상태입니다.'}), 400
        
        conn = get_db()
        c = conn.cursor()
        c.execute('UPDATE applications SET status = ? WHERE id = ?', (new_status, app_id))
        conn.commit()
        conn.close()
        
        return jsonify({'success': True, 'message': '상태가 변경되었습니다.'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/logout', methods=['POST'])
def logout():
    """로그아웃"""
    session.clear()
    return jsonify({'success': True})

# ==================== 에러 핸들러 ====================

@app.errorhandler(404)
def not_found(error):
    return render_template('index.html'), 404

if __name__ == '__main__':
    init_db()
    app.run(debug=True, host='0.0.0.0', port=5000)