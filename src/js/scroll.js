// ScrollSpy
(function () {
    const menu = document.querySelector('.menu')
    let links = menu.querySelectorAll('.menu__link')

	window.addEventListener('scroll', onScroll)

    menu.addEventListener('click', (e) => {
		let link = e.target;

		if (link.classList.contains('menu__link')) {
			e.preventDefault()
            // setActiveClass(link)
            scrollToTarget(link.hash)
		}
	});

    function onScroll(){
		let pos = window.pageYOffset;
		for (let i = links.length - 1; i >= 0; i--) {
			let link = links[i];
			let target = document.querySelector(link.hash);
			
			if ((pos + window.innerHeight / 2) > target.offsetTop) {
                setActiveClass(link)				
                break
			}
		}
	}

    function setActiveClass(link) {
        menu.querySelector('.menu__link--active').classList.remove('menu__link--active');
        link.classList.add('menu__link--active');
    }

    function scrollToTarget(id) {
		let target = document.querySelector(id)

		if (target !== null) {
			let pos = target.offsetTop - 64
			window.scrollTo({top: pos, behavior: 'smooth'})
		}
	}
})()
