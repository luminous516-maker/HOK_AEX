from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()


class Application(db.Model):
    """길드 가입 신청 모델"""
    __tablename__ = 'applications'

    application_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nickname = db.Column(db.String(50), nullable=False)
    discord_id = db.Column(db.String(50), nullable=False)
    tier = db.Column(db.String(20), nullable=False)
    champions_score = db.Column(db.String(50), nullable=False)
    position = db.Column(db.String(20), nullable=False)
    play_time = db.Column(db.Text, nullable=False)
    introduction = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), default='대기 중', nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        """모델을 딕셔너리로 변환"""
        return {
            'application_id': self.application_id,
            'nickname': self.nickname,
            'discord_id': self.discord_id,
            'tier': self.tier,
            'champions_score': self.champions_score,
            'position': self.position,
            'play_time': self.play_time,
            'introduction': self.introduction,
            'status': self.status,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S')
        }

    def __repr__(self):
        return f'<Application {self.application_id}: {self.nickname}>'