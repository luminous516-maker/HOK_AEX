/**
 * 공통 JavaScript 유틸리티
 */

// API 기본 URL
const API_BASE_URL = '/api';

/**
 * API 요청을 보내는 함수
 * @param {string} endpoint - API 엔드포인트
 * @param {object} options - fetch 옵션
 * @returns {Promise}
 */
async function apiCall(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    try {
        const response = await fetch(url, {
            ...defaultOptions,
            ...options,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || '요청 실패');
        }

        return data;
    } catch (error) {
        console.error('API 에러:', error);
        throw error;
    }
}

/**
 * 에러 메시지 표시
 * @param {string} message - 표시할 메시지
 * @param {string} elementId - 메시지를 표시할 요소의 ID
 */
function showError(message, elementId = 'errorMessage') {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
    } else {
        alert(message);
    }
}

/**
 * 성공 메시지 표시
 * @param {string} message - 표시할 메시지
 */
function showSuccess(message) {
    console.log('✓', message);
}

/**
 * 날짜 포맷 함수
 * @param {string} dateString - ISO 형식의 날짜 문자열
 * @returns {string} - 포맷된 날짜
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * 폼 데이터 객체로 변환
 * @param {HTMLFormElement} form - HTML 폼 요소
 * @returns {object} - 폼 데이터 객체
 */
function formToObject(form) {
    const formData = new FormData(form);
    const object = {};

    for (let [key, value] of formData) {
        object[key] = value;
    }

    return object;
}

// 페이지 로드 완료 시 실행
document.addEventListener('DOMContentLoaded', function() {
    console.log('✓ 페이지 로드 완료');
});