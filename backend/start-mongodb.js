const { MongoMemoryServer } = require('mongodb-memory-server');

async function start() {
  const mongod = await MongoMemoryServer.create({
    instance: {
      port: 27017,
      dbPath: './mongodb-data',
      storageEngine: 'wiredTiger'
    }
  });

  const uri = mongod.getUri();
  console.log(`🚀 In-memory MongoDB running at: ${uri}`);
  console.log('Press Ctrl+C to stop the server.');

  // Keep the process alive
  process.stdin.resume();
  process.on('SIGINT', async () => {
    await mongod.stop();
    console.log('MongoDB stopped.');
    process.exit(0);
  });
}

start().catch(console.error);
