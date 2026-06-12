document.getElementById('applicationForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        nickname: document.getElementById('nickname').value,
        discord_id: document.getElementById('discord_id').value,
        age: document.getElementById('age').value || null,
        tier: document.getElementById('tier').value,
        champions_score: document.getElementById('champions_score').value,
        position: document.getElementById('position').value,
        play_time: document.getElementById('play_time').value,
        introduction: document.getElementById('introduction').value
    };
    
    try {
        const response = await fetch('/api/apply', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            window.location.href = '/complete';
        } else {
            alert('오류: ' + data.message);
        }
    } catch (error) {
        alert('신청 중 오류가 발생했습니다.');
    }
});
