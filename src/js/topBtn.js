(function() {
    const scrollBtn = document.getElementById('topBtn')
    
    window.addEventListener('scroll', e => {
        if (window.pageYOffset > window.innerHeight) {
            scrollBtn.style.display = 'block'
        } else {
            scrollBtn.style.display = 'none'
        }
    })

    scrollBtn.addEventListener('click', e => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' })
    })
})()