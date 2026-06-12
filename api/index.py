from flask import Flask, render_template, request, jsonify, session, redirect, url_for
import json
from datetime import datetime
from functools import wraps

app = Flask(__name__, static_folder='static', template_folder='templates')
app.secret_key = 'aetherix-secret-key-2026'

# 메모리 기반 데이터 저장
applications_data = []

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
        
        # 메모리에 저장
        app_data = {
            'id': len(applications_data) + 1,
            'nickname': data['nickname'],
            'discord_id': data['discord_id'],
            'age': data.get('age') or None,
            'tier': data['tier'],
            'champions_score': data['champions_score'],
            'position': data['position'],
            'play_time': data['play_time'],
            'introduction': data['introduction'],
            'status': '대기',
            'created_at': datetime.now().isoformat()
        }
        
        applications_data.append(app_data)
        
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
        
        # 간단한 인증
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
        sorted_apps = sorted(applications_data, key=lambda x: x['created_at'], reverse=True)
        return jsonify({'success': True, 'data': sorted_apps})
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
        
        for app in applications_data:
            if app['id'] == app_id:
                app['status'] = new_status
                return jsonify({'success': True, 'message': '상태가 변경되었습니다.'})
        
        return jsonify({'success': False, 'message': '지원자를 찾을 수 없습니다.'}), 404
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

@app.errorhandler(500)
def server_error(error):
    return jsonify({'success': False, 'message': '서버 오류가 발생했습니다.'}), 500
