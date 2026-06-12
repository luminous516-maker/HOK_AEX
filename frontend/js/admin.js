/**
 * 운영진 관리 페이지 스크립트
 */

let allApplications = [];
let currentApplicationId = null;

document.addEventListener('DOMContentLoaded', function() {
    loadApplications();
    setupEventListeners();
});

/**
 * 이벤트 리스너 설정
 */
function setupEventListeners() {
    // 검색 기능
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', filterApplications);
    }

    // 필터 기능
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', filterApplications);
    }

    // 모달 닫기 버튼
    const closeBtn = document.querySelector('.close');
    const cancelBtn = document.getElementById('cancelBtn');
    const modal = document.getElementById('detailModal');

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('show');
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            modal.classList.remove('show');
        });
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });
    }

    // 승인 버튼
    const approveBtn = document.getElementById('approveBtn');
    if (approveBtn) {
        approveBtn.addEventListener('click', () => {
            updateApplicationStatus('승인');
        });
    }

    // 거절 버튼
    const rejectBtn = document.getElementById('rejectBtn');
    if (rejectBtn) {
        rejectBtn.addEventListener('click', () => {
            updateApplicationStatus('거절');
        });
    }
}

/**
 * 지원자 목록 로드
 */
async function loadApplications() {
    try {
        const response = await apiCall('/applications');
        allApplications = response.applications || [];
        displayApplications(allApplications);
    } catch (error) {
        console.error('지원자 로드 실패:', error);
    }
}

/**
 * 지원자 목록 표시
 */
function displayApplications(applications) {
    const tbody = document.getElementById('applicationsBody');

    if (!applications || applications.length === 0) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="8">지원자가 없습니다.</td></tr>';
        return;
    }

    tbody.innerHTML = applications.map(app => `
        <tr onclick="showApplicationDetail(${app.application_id})">
            <td>${app.application_id}</td>
            <td>${escapeHtml(app.nickname)}</td>
            <td>${escapeHtml(app.discord_id)}</td>
            <td>${escapeHtml(app.tier)}</td>
            <td>${escapeHtml(app.position)}</td>
            <td>${formatDate(app.created_at)}</td>
            <td><span class="status-badge status-${getStatusClass(app.status)}">${app.status}</span></td>
            <td>
                <button class="btn action-btn btn-primary" onclick="showApplicationDetail(${app.application_id}); return false;">
                    상세보기
                </button>
            </td>
        </tr>
    `).join('');
}

/**
 * 상태 클래스 반환
 */
function getStatusClass(status) {
    switch (status) {
        case '대기 중':
            return 'pending';
        case '승인':
            return 'approved';
        case '거절':
            return 'rejected';
        default:
            return 'pending';
    }
}

/**
 * 지원자 상세 정보 표시
 */
function showApplicationDetail(applicationId) {
    const application = allApplications.find(app => app.application_id === applicationId);

    if (!application) {
        showError('신청서를 찾을 수 없습니다.');
        return;
    }

    currentApplicationId = applicationId;

    const detailContent = document.getElementById('detailContent');
    detailContent.innerHTML = `
        <div class="detail-row">
            <span class="detail-label">신청 번호</span>
            <span class="detail-value">${application.application_id}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">게임 닉네임</span>
            <span class="detail-value">${escapeHtml(application.nickname)}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">디스코드 ID</span>
            <span class="detail-value">${escapeHtml(application.discord_id)}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">현재 티어</span>
            <span class="detail-value">${escapeHtml(application.tier)}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">챔피언스리그 점수</span>
            <span class="detail-value">${escapeHtml(application.champions_score)}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">주 포지션</span>
            <span class="detail-value">${escapeHtml(application.position)}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">플레이 가능 시간</span>
            <span class="detail-value">${escapeHtml(application.play_time)}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">자기소개</span>
            <span class="detail-value">${escapeHtml(application.introduction)}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">신청일</span>
            <span class="detail-value">${formatDate(application.created_at)}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">현재 상태</span>
            <span class="detail-value"><span class="status-badge status-${getStatusClass(application.status)}">${application.status}</span></span>
        </div>
    `;

    // 모달 표시
    const modal = document.getElementById('detailModal');
    modal.classList.add('show');
}

/**
 * 지원 상태 업데이트
 */
async function updateApplicationStatus(newStatus) {
    if (!currentApplicationId) {
        showError('신청서를 선택해주세요.');
        return;
    }

    try {
        const response = await apiCall(`/applications/${currentApplicationId}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status: newStatus }),
        });

        // 목록 다시 로드
        await loadApplications();

        // 모달 닫기
        const modal = document.getElementById('detailModal');
        modal.classList.remove('show');

        showSuccess(`신청이 "${newStatus}"으로 처리되었습니다.`);

    } catch (error) {
        showError(error.message || '상태 업데이트 실패');
    }
}

/**
 * 지원자 필터링
 */
function filterApplications() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;

    const filtered = allApplications.filter(app => {
        const matchesSearch = app.nickname.toLowerCase().includes(searchInput) ||
                             app.discord_id.toLowerCase().includes(searchInput);
        const matchesStatus = !statusFilter || app.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    displayApplications(filtered);
}

/**
 * HTML 이스케이프
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}