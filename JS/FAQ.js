// FAQ функциональность
document.addEventListener('DOMContentLoaded', function() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const header = item.querySelector('.faq-header');
        const toggle = item.querySelector('.faq-toggle');
        const answer = item.querySelector('.answer');
        
        header.addEventListener('click', function() {
            const isActive = item.classList.contains('active');
            

            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                    otherItem.querySelector('.faq-toggle').classList.remove('active');
                }
            });
            
            if (isActive) {
                item.classList.remove('active');
                toggle.classList.remove('active');
            } else {
                item.classList.add('active');
                toggle.classList.add('active');
            }
        });
    });
});
