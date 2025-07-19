// Script de inicialización para MongoDB
// Este archivo se ejecuta automáticamente cuando se inicia el contenedor de MongoDB

const db = db.getSiblingDB('foro-service');

// Crear usuario para la aplicación
db.createUser({
  user: 'foro_user',
  pwd: 'foro_password',
  roles: [
    {
      role: 'readWrite',
      db: 'foro-service'
    }
  ]
});

// Crear colección de posts si no existe
db.createCollection('posts');

// Crear índices para optimizar consultas
db.getCollection('posts').createIndex({ 'title': 'text', 'body': 'text', 'tags.value': 'text' });
db.getCollection('posts').createIndex({ 'authors.id': 1 });
db.getCollection('posts').createIndex({ 'createdAt': -1 });
db.getCollection('posts').createIndex({ 'tags.value': 1 });

console.log('✅ Base de datos foro-service inicializada correctamente');
console.log('✅ Usuario foro_user creado');
console.log('✅ Colección posts creada');
console.log('✅ Índices creados'); 