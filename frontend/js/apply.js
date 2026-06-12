/**
 * 길드 가입 신청 페이지 스크립트
 */

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('applicationForm');

    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
});

/**
 * 폼 제출 처리
 */
async function handleFormSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const errorElement = document.getElementById('errorMessage');

    try {
        // 폼 데이터 검증
        if (!validateForm(form)) {
            return;
        }

        // 폼 데이터를 객체로 변환
        const formData = formToObject(form);

        // 에러 메시지 초기화
        errorElement.style.display = 'none';

        // 로딩 상태로 변경
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = '신청 중...';
        submitBtn.disabled = true;

        // API로 신청 제출
        const response = await apiCall('/applications', {
            method: 'POST',
            body: JSON.stringify(formData),
        });

        // 신청 완료 페이지로 이동
        setTimeout(() => {
            window.location.href = '/complete';
        }, 1000);

    } catch (error) {
        showError(error.message || '신청 중 오류가 발생했습니다.');

        // 제출 버튼 복원
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.textContent = '신청하기';
        submitBtn.disabled = false;
    }
}

/**
 * 폼 검증
 */
function validateForm(form) {
    const nickname = form.querySelector('#nickname').value.trim();
    const discordId = form.querySelector('#discordId').value.trim();
    const tier = form.querySelector('#tier').value;
    const championsScore = form.querySelector('#championsScore').value;
    const position = form.querySelector('#position').value;
    const playTime = form.querySelector('#playTime').value.trim();
    const introduction = form.querySelector('#introduction').value.trim();

    // 닉네임 검증
    if (!nickname) {
        showError('게임 닉네임을 입력해주세요.');
        return false;
    }

    if (nickname.length > 50) {
        showError('닉네임은 50자 이하여야 합니다.');
        return false;
    }

    // 디스코드 ID 검증
    if (!discordId) {
        showError('디스코드 ID를 입력해주세요.');
        return false;
    }

    if (discordId.length > 50) {
        showError('디스코드 ID는 50자 이하여야 합니다.');
        return false;
    }

    // 티어 검증
    if (!tier) {
        showError('현재 티어를 선택해주세요.');
        return false;
    }

    // 챔피언스리그 점수 검증
    if (!championsScore) {
        showError('챔피언스리그 점수를 선택해주세요.');
        return false;
    }

    // 포지션 검증
    if (!position) {
        showError('주 포지션을 선택해주세요.');
        return false;
    }

    // 플레이 가능 시간 검증
    if (!playTime) {
        showError('플레이 가능 시간을 입력해주세요.');
        return false;
    }

    // 자기소개 검증
    if (!introduction) {
        showError('자기소개를 작성해주세요.');
        return false;
    }

    if (introduction.length > 500) {
        showError('자기소개는 500자 이하여야 합니다.');
        return false;
    }

    return true;
}