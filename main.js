// Scroll Reveal Animation
const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, observerOptions);

document.querySelectorAll('.reveal').forEach(el => {
    observer.observe(el);
});

// Header Style Change on Scroll
window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    if (window.scrollY > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Smooth Scroll for Navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Board Write Form Logic
const showWriteFormBtn = document.getElementById('showWriteFormBtn');
const writeFormContainer = document.getElementById('writeFormContainer');
const cancelWriteBtn = document.getElementById('cancelWriteBtn');
const submitPostBtn = document.getElementById('submitPostBtn');
const boardList = document.getElementById('boardList');
const writeBtnContainer = document.getElementById('writeBtnContainer');

if (showWriteFormBtn) {
    showWriteFormBtn.addEventListener('click', () => {
        writeFormContainer.style.display = 'block';
        writeBtnContainer.style.display = 'none';
    });

    cancelWriteBtn.addEventListener('click', () => {
        writeFormContainer.style.display = 'none';
        writeBtnContainer.style.display = 'block';
        document.getElementById('postTitle').value = '';
        document.getElementById('postAuthor').value = '';
    });

    submitPostBtn.addEventListener('click', () => {
        const title = document.getElementById('postTitle').value.trim();
        const author = document.getElementById('postAuthor').value.trim() || '익명';
        
        if (!title) {
            alert('제목을 입력해주세요.');
            return;
        }

        const today = new Date();
        const dateString = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;

        const newItem = document.createElement('div');
        newItem.className = 'board-item';
        newItem.style.cssText = 'border-bottom: 1px solid #ddd; color: var(--text-dark); background: transparent; display: flex; justify-content: space-between; padding: 20px;';
        
        newItem.innerHTML = `
            <span style="flex: 1;">${title}</span>
            <span style="color: var(--text-gray); font-size: 0.9rem;">${author} | ${dateString}</span>
        `;

        boardList.insertBefore(newItem, boardList.firstChild);

        // Reset and hide form
        writeFormContainer.style.display = 'none';
        writeBtnContainer.style.display = 'block';
        document.getElementById('postTitle').value = '';
        document.getElementById('postAuthor').value = '';
    });
}

// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const nav = document.querySelector('nav');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenuBtn.classList.toggle('active');
        nav.classList.toggle('active');
    });

    // Close menu when clicking a link
    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenuBtn.classList.remove('active');
            nav.classList.remove('active');
        });
    });
}
