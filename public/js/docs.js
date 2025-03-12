document.addEventListener('DOMContentLoaded', () => {
  // Add animation classes to elements as they appear in the viewport
  const animatedElements = document.querySelectorAll('.card, .feature-card, .endpoint');
  
  // Observer for animation on scroll
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1
  });
  
  // Observe each element
  animatedElements.forEach(element => {
    element.style.opacity = "0";
    observer.observe(element);
  });
  
  // Add click event for endpoint toggles
  const endpointHeaders = document.querySelectorAll('.endpoint-header');
  
  endpointHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const endpoint = header.closest('.endpoint');
      endpoint.classList.toggle('expanded');
      
      // Toggle endpoint description visibility
      const description = endpoint.querySelector('.endpoint-description');
      if (description) {
        description.style.display = endpoint.classList.contains('expanded') ? 'block' : 'none';
      }
    });
  });
  
  // Initialize endpoint descriptions as hidden
  document.querySelectorAll('.endpoint-description').forEach(desc => {
    desc.style.display = 'none';
  });
  
  // Copy endpoint path to clipboard
  const endpointPaths = document.querySelectorAll('.endpoint-path');
  
  endpointPaths.forEach(path => {
    path.addEventListener('click', (e) => {
      e.stopPropagation();
      
      // Copy to clipboard
      navigator.clipboard.writeText(path.textContent.trim())
        .then(() => {
          // Show copied message
          const originalText = path.textContent;
          path.textContent = '✓ Copied!';
          
          setTimeout(() => {
            path.textContent = originalText;
          }, 1500);
        })
        .catch(err => {
          console.error('Could not copy text: ', err);
        });
    });
  });
  
  // Server status visual indicator update
  const statusIndicator = document.querySelector('.status');
  if (statusIndicator) {
    // This would typically fetch from an actual status endpoint
    // For demo purposes, we'll just set it to active
    statusIndicator.textContent = 'Đang hoạt động';
    statusIndicator.style.backgroundColor = 'var(--success-color)';
  }
  
  // Search functionality
  const searchInput = document.getElementById('search-endpoints');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase();
      const endpoints = document.querySelectorAll('.endpoint');
      
      endpoints.forEach(endpoint => {
        const pathText = endpoint.querySelector('.endpoint-path').textContent.toLowerCase();
        const descText = endpoint.querySelector('.endpoint-description').textContent.toLowerCase();
        
        if (pathText.includes(searchTerm) || descText.includes(searchTerm)) {
          endpoint.style.display = 'block';
        } else {
          endpoint.style.display = 'none';
        }
      });
    });
  }
}); 