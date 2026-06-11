// functions/redirects.js
// Minimal CloudFront Function: just passes the request through as it is

function handler(event) {
    var request = event.request
  
    // Later we can add nice redirect logic here (eg for React routes)
    return request
  }
