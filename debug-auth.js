// Script de debug para probar autenticación
// Ejecutar en la consola del navegador después del login

console.log('=== DEBUG AUTENTICACIÓN ===');

// 1. Verificar cookies
const allCookies = document.cookie;
console.log('1. Todas las cookies:', allCookies);

const authCookie = document.cookie
  .split('; ')
  .find(row => row.startsWith('auth_token='))
  ?.split('=')[1];

console.log('2. Cookie auth_token:', authCookie ? `Presente (${authCookie.substring(0, 20)}...)` : 'NO ENCONTRADA');

// 2. Probar llamada manual al API
if (authCookie) {
  fetch('http://localhost:8000/api/v1/users/me', {
    headers: {
      'Authorization': `Bearer ${authCookie}`,
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    console.log('3. Respuesta /users/me:', response.status, response.statusText);
    return response.json();
  })
  .then(data => {
    console.log('4. Datos del usuario:', data);
  })
  .catch(error => {
    console.error('5. Error al llamar /users/me:', error);
  });
} else {
  console.log('3. No se puede probar /users/me - no hay token');
}

// 3. Verificar el estado de React Query
setTimeout(() => {
  const queryClient = window.__REACT_QUERY_CLIENT__;
  if (queryClient) {
    const queries = queryClient.getQueryCache().getAll();
    console.log('6. Queries en cache:', queries.map(q => ({ 
      key: q.queryKey, 
      state: q.state.status,
      data: q.state.data 
    })));
  }
}, 1000);