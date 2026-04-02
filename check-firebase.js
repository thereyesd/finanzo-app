import app from './src/config/firebase.js';

console.log('Firebase App Initialized:', app.name);
console.log('Firebase Config:', {
    authDomain: app.options.authDomain,
    projectId: app.options.projectId
});
