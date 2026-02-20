document.addEventListener("DOMContentLoaded", function () {
    var searchBar = document.getElementById('searchBar');
    if (searchBar) {
        searchBar.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                search();
            }
        });
    }

    // Mobile Menu Toggle
    var navToggle = document.querySelector('.nav-toggle');
    var navLinks = document.querySelector('.nav-links');
    
    if (navToggle && navLinks) {
        // Toggle menu
        navToggle.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent clicks from bubbling
            navLinks.classList.toggle('active');
            navToggle.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navToggle.contains(e.target) && !navLinks.contains(e.target) && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                navToggle.classList.remove('active');
            }
        });

        // Close menu when a link is clicked
        var menuLinks = document.querySelectorAll('.nav-links a');
        menuLinks.forEach(function(link) {
            link.addEventListener('click', function(e) {
                // If it's the dropdown toggle in mobile, don't close yet (handled below)
                if (window.innerWidth <= 768 && link.parentElement.classList.contains('has-dropdown')) {
                    return;
                }
                
                // Otherwise close the menu
                navLinks.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });
    }

    // Mobile Dropdown Toggle
    var dropdowns = document.querySelectorAll('.has-dropdown > .nav-link');
    dropdowns.forEach(function(link) {
        link.addEventListener('click', function(e) {
            // Check if we are in mobile view (matches CSS media query)
            if (window.innerWidth <= 768) {
                e.preventDefault();
                e.stopPropagation(); // Prevent closing the menu immediately
                var parent = this.parentElement;
                parent.classList.toggle('open');
            }
        });
    });
});

function search() {
    var input = document.getElementById("searchBar");
    if (input && input.value) {
        window.find(input.value);
    }
}