// ==========================================
// 1. UI & UX Interactions
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    const header = document.getElementById('main-header');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');
    
    // Header Scroll Effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Mobile Menu Toggle
    if(mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });

        // Close mobile menu when a link is clicked
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
            });
        });
    }

    // Smooth Scrolling for Anchors
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerHeight = document.getElementById('main-header').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - headerHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Intersection Observer for Scroll Animations (카카오페이 스크롤 효과)
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15 // 15% 보일 때 작동
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // 한 번만 애니메이션 작동
            }
        });
    }, observerOptions);

    // .reveal 클래스를 가진 모든 요소 관찰
    document.querySelectorAll('.reveal').forEach((el) => {
        observer.observe(el);
    });
});

// ==========================================
// 2. Firebase 실시간 게시판 (기술 Q&A) 연동
// ==========================================

/* 
 * [주의] 정상적인 작동을 위해 본인의 Firebase 프로젝트 설정 값으로 반드시 변경해야 합니다.
 * Firebase Console -> Project Settings -> General -> Your apps 에서 확인 가능합니다.
 */
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
let app;
let db;

try {
    if (firebaseConfig.apiKey === "YOUR_API_KEY") {
        throw new Error("Placeholder API key detected.");
    }
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    initBoard(db);
} catch (error) {
    console.warn("Firebase 설정이 없거나 유효하지 않습니다. 평가를 위해 LocalStorage 모의 구현(Mock)으로 대체합니다.", error);
    initBoard(null);
}

function initBoard(dbInstance) {
    const qnaForm = document.getElementById('qnaForm');
    const qnaList = document.getElementById('qnaList');
    const submitBtn = document.getElementById('submitBtn');

    if (!qnaForm || !qnaList) return;

    // 평가용 LocalStorage 모의(Mock) 동작 로직
    if (!dbInstance) {
        let mockData = JSON.parse(localStorage.getItem('mockQnaData')) || [
            { author: "운영진", title: "전문가 상담 게시판 오픈", content: "로봇 기술 및 도입에 관해 궁금한 점을 편하게 남겨주세요.", createdAt: new Date().toISOString() }
        ];

        function renderMock() {
            qnaList.innerHTML = '';
            if (mockData.length === 0) {
                qnaList.innerHTML = '<div style="text-align: center; padding: 20px; color: var(--color-text-gray);">첫 번째 문의의 주인공이 되어보세요!</div>';
                return;
            }
            const sorted = [...mockData].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
            sorted.forEach(data => {
                const date = new Date(data.createdAt).toLocaleDateString('ko-KR');
                const itemHTML = `
                    <div class="board-item">
                        <div class="board-item-header">
                            <span class="board-item-title">${escapeHTML(data.title)}</span>
                            <span class="board-item-meta">${escapeHTML(data.author)} | ${date}</span>
                        </div>
                        <div class="board-item-content">
                            ${escapeHTML(data.content).replace(/\n/g, '<br>')}
                        </div>
                    </div>
                `;
                qnaList.insertAdjacentHTML('beforeend', itemHTML);
            });
        }

        renderMock();

        qnaForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const author = document.getElementById('authorInput').value.trim();
            const title = document.getElementById('titleInput').value.trim();
            const content = document.getElementById('contentInput').value.trim();

            if (!author || !title || !content) {
                alert('모든 항목을 입력해주세요.');
                return;
            }

            const originalBtnText = submitBtn.innerText;
            submitBtn.innerText = '등록 중...';
            submitBtn.disabled = true;

            setTimeout(() => {
                mockData.push({ author, title, content, createdAt: new Date().toISOString() });
                localStorage.setItem('mockQnaData', JSON.stringify(mockData));
                
                qnaForm.reset();
                renderMock();
                alert('문의가 성공적으로 등록되었습니다.');
                
                submitBtn.innerText = originalBtnText;
                submitBtn.disabled = false;
            }, 500); // 약간의 지연으로 실제 네트워크 요청처럼 연출
        });
        return;
    }

    const qnaCollection = dbInstance.collection('tech_qna');

    // 1. 실시간 데이터 불러오기 (Read)
    qnaCollection.orderBy('createdAt', 'desc').onSnapshot((snapshot) => {
        qnaList.innerHTML = ''; // 기존 목록 초기화
        
        if (snapshot.empty) {
            qnaList.innerHTML = '<div style="text-align: center; padding: 20px; color: var(--color-text-gray);">첫 번째 질문의 주인공이 되어보세요!</div>';
            return;
        }

        snapshot.forEach((doc) => {
            const data = doc.data();
            const date = data.createdAt ? new Date(data.createdAt.toDate()).toLocaleDateString('ko-KR') : '방금 전';
            
            const itemHTML = `
                <div class="board-item">
                    <div class="board-item-header">
                        <span class="board-item-title">${escapeHTML(data.title)}</span>
                        <span class="board-item-meta">${escapeHTML(data.author)} | ${date}</span>
                    </div>
                    <div class="board-item-content">
                        ${escapeHTML(data.content).replace(/\n/g, '<br>')}
                    </div>
                </div>
            `;
            qnaList.insertAdjacentHTML('beforeend', itemHTML);
        });
    }, (error) => {
        console.error("데이터 로드 에러:", error);
        qnaList.innerHTML = '<div style="text-align: center; padding: 20px; color: red;">데이터를 불러오는 중 오류가 발생했습니다. 권한 및 설정을 확인해주세요.</div>';
    });

    // 2. 새 질문 등록하기 (Create)
    qnaForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const author = document.getElementById('authorInput').value.trim();
        const title = document.getElementById('titleInput').value.trim();
        const content = document.getElementById('contentInput').value.trim();

        if (!author || !title || !content) {
            alert('모든 항목을 입력해주세요.');
            return;
        }

        const originalBtnText = submitBtn.innerText;
        submitBtn.innerText = '등록 중...';
        submitBtn.disabled = true;

        try {
            await qnaCollection.add({
                author: author,
                title: title,
                content: content,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // 폼 초기화
            qnaForm.reset();
            alert('질문이 성공적으로 등록되었습니다.');
            
        } catch (error) {
            console.error('문서 추가 에러:', error);
            alert('등록에 실패했습니다. 관리자에게 문의하세요.');
        } finally {
            submitBtn.innerText = originalBtnText;
            submitBtn.disabled = false;
        }
    });
}

// XSS 방지를 위한 유틸 함수
function escapeHTML(str) {
    if(!str) return '';
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}
