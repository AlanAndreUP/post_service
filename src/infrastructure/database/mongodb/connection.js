const mongoose = require('mongoose');

class MongoDBConnection {
  constructor() {
    this.isConnected = false;
  }

  async connect(uri) {
    try {
      if (this.isConnected) {
        console.log('MongoDB ya está conectado');
        return;
      }

      const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        bufferMaxEntries: 0,
        bufferCommands: false
      };

      await mongoose.connect(uri, options);
      
      this.isConnected = true;
      console.log('✅ MongoDB conectado exitosamente');

      // Manejar eventos de conexión
      mongoose.connection.on('error', (error) => {
        console.error('❌ Error de conexión MongoDB:', error);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        console.log('⚠️ MongoDB desconectado');
        this.isConnected = false;
      });

      mongoose.connection.on('reconnected', () => {
        console.log('🔄 MongoDB reconectado');
        this.isConnected = true;
      });

      // Manejar cierre graceful
      process.on('SIGINT', async () => {
        await this.disconnect();
        process.exit(0);
      });

    } catch (error) {
      console.error('❌ Error al conectar MongoDB:', error);
      throw error;
    }
  }

  async disconnect() {
    try {
      if (this.isConnected) {
        await mongoose.connection.close();
        this.isConnected = false;
        console.log('🔌 MongoDB desconectado');
      }
    } catch (error) {
      console.error('❌ Error al desconectar MongoDB:', error);
      throw error;
    }
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      readyState: mongoose.connection.readyState
    };
  }
}

// Singleton instance
const mongoDBConnection = new MongoDBConnection();

module.exports = mongoDBConnection; 