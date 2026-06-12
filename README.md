# Aetherix E-sports Official Recruitment Website

아너오브킹즈 길드 「Aetherix E-sports」 공식 신청 홈페이지

## 프로젝트 개요

Honor of Kings 길드 Aetherix E-sports의 신규 길드원을 모집하기 위한 공식 신청 홈페이지입니다.

## 기능

- ✅ 메인 페이지 (길드 소개)
- ✅ 길드 가입 신청 양식
- ✅ 신청서 제출 및 저장
- ✅ 관리자 로그인 및 대시보드
- ✅ 지원자 목록 조회 및 관리

## 기술 스택

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Python (Flask)
- **Database**: SQLite

## 설치 및 실행

### 1. 프로젝트 클론
```bash
git clone https://github.com/luminous516-maker/HOK_AEX.git
cd HOK_AEX
```

### 2. Python 가상환경 설정
```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

### 3. 의존성 설치
```bash
pip install -r requirements.txt
```

### 4. 데이터베이스 초기화
```bash
python app.py
```

### 5. 서버 시작
```bash
python app.py
```

브라우저에서 `http://localhost:5000` 접속

## 파일 구조

```
HOK_AEX/
├── app.py                 # Flask 메인 서버
├── requirements.txt       # Python 패키지
├── database.db           # SQLite 데이터베이스
├── static/
│   ├── css/
│   │   ├── style.css
│   │   └── admin.css
│   └── js/
│       ├── form.js
│       └── admin.js
└── templates/
    ├── index.html        # 메인 페이지
    ├── apply.html        # 신청 페이지
    ├── complete.html     # 완료 페이지
    └── admin.html        # 관리자 페이지
```

## 관리자 정보

- **ID**: admin
- **Password**: admin123

## 문의

Discord: Aetherix E-sports