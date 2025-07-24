require('dotenv').config();
const { S3Client, ListBucketsCommand, HeadBucketCommand } = require('@aws-sdk/client-s3');

async function testR2Config() {
  console.log('🧪 Probando configuración de Cloudflare R2...\n');

  // Verificar variables de entorno
  const requiredVars = [
    'CLOUDFLARE_R2_ENDPOINT',
    'CLOUDFLARE_R2_ACCESS_KEY_ID',
    'CLOUDFLARE_R2_SECRET_ACCESS_KEY',
    'CLOUDFLARE_R2_BUCKET_NAME',
    'CLOUDFLARE_R2_PUBLIC_URL'
  ];

  console.log('📋 Variables de entorno:');
  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (value) {
      // Ocultar valores sensibles
      const displayValue = varName.includes('SECRET') || varName.includes('KEY') 
        ? `${value.substring(0, 8)}...` 
        : value;
      console.log(`  ✅ ${varName}: ${displayValue}`);
    } else {
      console.log(`  ❌ ${varName}: NO CONFIGURADA`);
    }
  }

  console.log('\n🔧 Creando cliente S3...');
  
  try {
    const s3Client = new S3Client({
      region: 'auto',
      endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
      },
    });

    console.log('✅ Cliente S3 creado exitosamente');

    // Probar conexión listando buckets
    console.log('\n📦 Probando conexión...');
    const listCommand = new ListBucketsCommand({});
    const buckets = await s3Client.send(listCommand);
    
    console.log('✅ Conexión exitosa');
    console.log(`📋 Buckets disponibles: ${buckets.Buckets?.length || 0}`);

    // Verificar si el bucket específico existe
    console.log(`\n🔍 Verificando bucket: ${process.env.CLOUDFLARE_R2_BUCKET_NAME}`);
    const headCommand = new HeadBucketCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME
    });
    
    await s3Client.send(headCommand);
    console.log('✅ Bucket encontrado y accesible');

    console.log('\n🎉 ¡Configuración de Cloudflare R2 válida!');
    console.log('\n📝 Resumen:');
    console.log(`  🌐 Endpoint: ${process.env.CLOUDFLARE_R2_ENDPOINT}`);
    console.log(`  📦 Bucket: ${process.env.CLOUDFLARE_R2_BUCKET_NAME}`);
    console.log(`  🔗 URL Pública: ${process.env.CLOUDFLARE_R2_PUBLIC_URL}`);

  } catch (error) {
    console.error('\n❌ Error en la configuración:');
    console.error(`  ${error.message}`);
    
    if (error.message.includes('Access Denied')) {
      console.log('\n💡 Sugerencias:');
      console.log('  - Verifica que las credenciales sean correctas');
      console.log('  - Asegúrate de que el token tenga permisos de R2');
    } else if (error.message.includes('NoSuchBucket')) {
      console.log('\n💡 Sugerencias:');
      console.log('  - Verifica que el nombre del bucket sea correcto');
      console.log('  - Asegúrate de que el bucket exista en tu cuenta de R2');
    } else if (error.message.includes('InvalidAccessKeyId')) {
      console.log('\n💡 Sugerencias:');
      console.log('  - Verifica que el Access Key ID sea correcto');
      console.log('  - Asegúrate de que el token esté activo');
    }
  }
}

// Ejecutar el test
testR2Config().catch(console.error); 