document.addEventListener("DOMContentLoaded", function () {
    var searchBar = document.getElementById('searchBar');
    if (searchBar) {
        searchBar.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                search();
            }
        });
    }
});

function search() {
    var input = document.getElementById("searchBar");
    if (input && input.value) {
        window.find(input.value);
    }
}