let currentFilter = 'all';
let allApplications = [];
let currentSelectedId = null;

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', () => {
    loadApplications();
    setupEventListeners();
});

function setupEventListeners() {
    // 필터 버튼
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.getAttribute('data-filter');
            renderTable();
        });
    });

    // 모달 닫기
    document.querySelector('.close-button').addEventListener('click', closeModal);
    document.querySelector('.close-modal').addEventListener('click', closeModal);
    
    // 승인/거절 버튼
    document.getElementById('approveBtn').addEventListener('click', () => {
        updateStatus(currentSelectedId, '승인');
    });
    document.getElementById('rejectBtn').addEventListener('click', () => {
        updateStatus(currentSelectedId, '거절');
    });
    
    // 로그아웃
    document.getElementById('logoutBtn').addEventListener('click', logout);
}

async function loadApplications() {
    try {
        const response = await fetch('/api/applications');
        const data = await response.json();
        
        if (data.success) {
            allApplications = data.data;
            document.getElementById('totalCount').textContent = allApplications.length;
            renderTable();
        }
    } catch (error) {
        console.error('지원자 목록 로드 실패:', error);
    }
}

function renderTable() {
    const tbody = document.getElementById('applicationsBody');
    tbody.innerHTML = '';
    
    let filtered = allApplications;
    if (currentFilter !== 'all') {
        filtered = allApplications.filter(app => app.status === currentFilter);
    }
    
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="8">지원자가 없습니다.</td></tr>';
        return;
    }
    
    filtered.forEach((app, index) => {
        const row = document.createElement('tr');
        const date = new Date(app.created_at).toLocaleDateString('ko-KR');
        
        let statusBadge = '';
        if (app.status === '대기') {
            statusBadge = '<span class="status-badge waiting">대기중</span>';
        } else if (app.status === '승인') {
            statusBadge = '<span class="status-badge approved">승인</span>';
        } else if (app.status === '거절') {
            statusBadge = '<span class="status-badge rejected">거절</span>';
        }
        
        row.innerHTML = `
            <td>${app.id}</td>
            <td>${app.nickname}</td>
            <td>${app.discord_id}</td>
            <td>${app.tier}</td>
            <td>${app.position}</td>
            <td>${date}</td>
            <td>${statusBadge}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-info btn-small" onclick="showDetail(${app.id})">상세보기</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function showDetail(id) {
    const app = allApplications.find(a => a.id === id);
    if (!app) return;
    
    currentSelectedId = id;
    const modalBody = document.getElementById('modalBody');
    const date = new Date(app.created_at).toLocaleDateString('ko-KR');
    
    modalBody.innerHTML = `
        <div class="modal-info-group">
            <div class="modal-info-label">게임 닉네임</div>
            <div class="modal-info-value">${app.nickname}</div>
        </div>
        <div class="modal-info-group">
            <div class="modal-info-label">디스코드 ID</div>
            <div class="modal-info-value">${app.discord_id}</div>
        </div>
        <div class="modal-info-group">
            <div class="modal-info-label">나이</div>
            <div class="modal-info-value">${app.age || '미기재'}</div>
        </div>
        <div class="modal-info-group">
            <div class="modal-info-label">현재 티어</div>
            <div class="modal-info-value">${app.tier}</div>
        </div>
        <div class="modal-info-group">
            <div class="modal-info-label">챔피언스리그 점수</div>
            <div class="modal-info-value">${app.champions_score}</div>
        </div>
        <div class="modal-info-group">
            <div class="modal-info-label">주 포지션</div>
            <div class="modal-info-value">${app.position}</div>
        </div>
        <div class="modal-info-group">
            <div class="modal-info-label">플레이 가능 시간</div>
            <div class="modal-info-value">${app.play_time}</div>
        </div>
        <div class="modal-info-group">
            <div class="modal-info-label">자기소개</div>
            <div class="modal-info-value" style="white-space: pre-wrap;">${app.introduction}</div>
        </div>
        <div class="modal-info-group">
            <div class="modal-info-label">신청 일시</div>
            <div class="modal-info-value">${date}</div>
        </div>
        <div class="modal-info-group">
            <div class="modal-info-label">상태</div>
            <div class="modal-info-value">${app.status}</div>
        </div>
    `;
    
    document.getElementById('detailModal').classList.add('active');
}

function closeModal() {
    document.getElementById('detailModal').classList.remove('active');
}

async function updateStatus(id, status) {
    try {
        const response = await fetch(`/api/applications/${id}/status`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({status: status})
        });
        
        const data = await response.json();
        
        if (data.success) {
            closeModal();
            loadApplications();
            alert(data.message);
        } else {
            alert('오류: ' + data.message);
        }
    } catch (error) {
        alert('상태 변경 중 오류가 발생했습니다.');
    }
}

async function logout() {
    try {
        await fetch('/api/logout', {method: 'POST'});
        window.location.href = '/';
    } catch (error) {
        alert('로그아웃 중 오류가 발생했습니다.');
    }
}
