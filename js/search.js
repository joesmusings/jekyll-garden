(function() {
  try {
    // Check if lunr is available
    if (typeof lunr === 'undefined') {
      console.error('Lunr library is not loaded');
      return;
    }

    // Check if we have the store object
    if (typeof window.store === 'undefined') {
      console.error('Search index is not available');
      return;
    }

    // Initialize lunr index
    var idx = lunr(function () {
      this.ref('id');
      this.field('title', { boost: 10 });
      this.field('content');

      // Add documents to index
      Object.keys(window.store).forEach(function(key) {
        this.add({
          'id': key,
          'title': window.store[key].title,
          'content': window.store[key].content
        });
      }, this);
    });

    function displaySearchResults(results, store) {
      var searchResults = document.getElementById('search-results');
      
      if (results.length) {
        var appendString = '';
        
        for (var i = 0; i < results.length; i++) {
          var item = store[results[i].ref];
          var snippetText = item.content;
          var searchTerm = document.getElementById('search-box').value;
          
          // Create a snippet that shows text around the first match
          if (snippetText && snippetText.length > 200) {
            var firstMatch = snippetText.toLowerCase().indexOf(searchTerm.toLowerCase());
            if (firstMatch === -1) firstMatch = 0;
            var start = Math.max(0, firstMatch - 100);
            var end = Math.min(snippetText.length, start + 200);
            snippetText = (start > 0 ? '...' : '') + 
                         snippetText.substring(start, end) + 
                         (end < snippetText.length ? '...' : '');
          }
          
          appendString += '<div class="search-result">';
          appendString += '<h3><a href="' + item.url + '">' + item.title + '</a></h3>';
          appendString += '<p>' + snippetText + '</p>';
          appendString += '</div>';
        }
        
        searchResults.innerHTML = appendString;
      } else {
        searchResults.innerHTML = '<div class="search-no-results">No results found</div>';
      }
    }

    function performSearch(searchTerm) {
      if (searchTerm) {
        try {
          var results = idx.search(searchTerm);
          displaySearchResults(results, window.store);
        } catch (e) {
          document.getElementById('search-results').innerHTML = 
            '<div class="search-error">An error occurred while searching. Please try again.</div>';
        }
      } else {
        document.getElementById('search-results').innerHTML = '';
      }
    }

    // Handle the search box input
    var searchBox = document.getElementById('search-box');
    if (!searchBox) {
      return;
    }

    var searchTerm = new URLSearchParams(window.location.search).get('query');
    
    if (searchTerm) {
      searchBox.value = searchTerm;
      performSearch(searchTerm);
    }

    // Real-time search as user types
    var debounceTimeout;
    searchBox.addEventListener('input', function(e) {
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(function() {
        performSearch(e.target.value);
      }, 250); // Debounce for 250ms
    });

  } catch (e) {
    console.error('Search initialization error:', e);
  }
})();
  