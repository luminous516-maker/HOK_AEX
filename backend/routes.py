from flask import Blueprint, request, jsonify
from models import db, Application

api = Blueprint('api', __name__, url_prefix='/api')


# ============ 신청 기능 ============

@api.route('/applications', methods=['POST'])
def create_application():
    """새로운 신청서 생성"""
    try:
        data = request.json
        
        # 필수 항목 검증
        required_fields = ['nickname', 'discord_id', 'tier', 'champions_score', 
                          'position', 'play_time', 'introduction']
        
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field}은(는) 필수 항목입니다.'}), 400
        
        # 새 신청서 생성
        new_application = Application(
            nickname=data['nickname'],
            discord_id=data['discord_id'],
            tier=data['tier'],
            champions_score=data['champions_score'],
            position=data['position'],
            play_time=data['play_time'],
            introduction=data['introduction'],
            status='대기 중'
        )
        
        db.session.add(new_application)
        db.session.commit()
        
        return jsonify({
            'message': '신청이 완료되었습니다.',
            'application_id': new_application.application_id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@api.route('/applications', methods=['GET'])
def get_applications():
    """전체 신청서 조회"""
    try:
        applications = Application.query.order_by(Application.created_at.desc()).all()
        return jsonify({
            'applications': [app.to_dict() for app in applications],
            'total': len(applications)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@api.route('/applications/<int:application_id>', methods=['GET'])
def get_application(application_id):
    """특정 신청서 조회"""
    try:
        application = Application.query.get(application_id)
        
        if not application:
            return jsonify({'error': '신청서를 찾을 수 없습니다.'}), 404
        
        return jsonify(application.to_dict()), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ============ 관리 기능 ============

@api.route('/applications/<int:application_id>/status', methods=['PATCH'])
def update_application_status(application_id):
    """신청 상태 업데이트 (승인/거절)"""
    try:
        data = request.json
        new_status = data.get('status')
        
        # 상태 검증
        valid_statuses = ['대기 중', '승인', '거절']
        if new_status not in valid_statuses:
            return jsonify({'error': f'유효하지 않은 상태입니다. ({', '.join(valid_statuses)})'}), 400
        
        application = Application.query.get(application_id)
        
        if not application:
            return jsonify({'error': '신청서를 찾을 수 없습니다.'}), 404
        
        application.status = new_status
        db.session.commit()
        
        return jsonify({
            'message': '상태가 업데이트되었습니다.',
            'application': application.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@api.route('/applications/<int:application_id>', methods=['DELETE'])
def delete_application(application_id):
    """신청서 삭제"""
    try:
        application = Application.query.get(application_id)
        
        if not application:
            return jsonify({'error': '신청서를 찾을 수 없습니다.'}), 404
        
        db.session.delete(application)
        db.session.commit()
        
        return jsonify({'message': '신청서가 삭제되었습니다.'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# ============ 헬스 체크 ============

@api.route('/health', methods=['GET'])
def health_check():
    """API 상태 확인"""
    return jsonify({'status': 'OK', 'message': 'API is running'}), 200