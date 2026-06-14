

// k6-script.js - Run with: k6 run k6-script.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Trend, Rate } from 'k6/metrics';

// Custom metrics
const requestsCounter = new Counter('requests');
const responseTimeTrend = new Trend('response_time');
const errorRate = new Rate('errors');

// Test configuration
export const options = {
    stages: [
        { duration: '30s', target: 20 },  // Ramp up to 20 users
        { duration: '1m', target: 50 },   // Ramp up to 50 users
        { duration: '2m', target: 1000 },  // Ramp up to 1000 users
        { duration: '1m', target: 50 },   // Ramp down to 50 users
        { duration: '30s', target: 0 },   // Ramp down to 0
    ],
    thresholds: {
        'http_req_duration': ['p(95)<500'], // 95% of requests < 500ms
        'errors': ['rate<0.05'],            // Error rate < 5%
    },
};

// Test data
const baseUrl = 'http://localhost:5500/online-clothing-store'; 

// Simulated user behavior
export default function() {
    // 1. Homepage load
    let homeRes = http.get(`${baseUrl}/index.html`);
    check(homeRes, {
        'homepage status is 200': (r) => r.status === 200,
        'homepage loads in < 500ms': (r) => r.timings.duration < 500,
    });
    
    // 2. Product grid render (simulated)
    let productRes = http.get(`${baseUrl}/js/script.js`);
    check(productRes, {
        'script loads': (r) => r.status === 200,
    });
    
    // 3. CSS load
    let cssRes = http.get(`${baseUrl}/css/style.css`);
    check(cssRes, {
        'CSS loads': (r) => r.status === 200,
    });
    
    // 4. Simulate adding to cart (POST simulation)
    let cartData = {
        productId: Math.floor(Math.random() * 12) + 1,
        quantity: Math.floor(Math.random() * 3) + 1,
    };
    
    // Note: Since it's client-side only, we simulate localStorage operations
    // In production with backend, you would POST to an API endpoint
    
    sleep(Math.random() * 3); // Random think time between 0-3 seconds
    
    // Record metrics
    requestsCounter.add(1);
    responseTimeTrend.add(homeRes.timings.duration);
    
    if (homeRes.status !== 200) {
        errorRate.add(1);
    }
}

// Stress test configuration
export const stressOptions = {
    stages: [
        { duration: '2m', target: 200 },  // Ramp up to 200 users
        { duration: '3m', target: 500 },  // Ramp up to 500 users
        { duration: '2m', target: 0 },    // Ramp down
    ],
};

// Spike test configuration
export const spikeOptions = {
    stages: [
        { duration: '1m', target: 50 },   // Normal load
        { duration: '10s', target: 500 }, // Spike to 500 users
        { duration: '1m', target: 500 },  // Stay at peak
        { duration: '10s', target: 50 },  // Back to normal
        { duration: '1m', target: 0 },    // Ramp down
    ],
};