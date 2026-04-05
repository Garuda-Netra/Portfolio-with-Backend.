import mongoose from 'mongoose';
import dns from 'dns';

function getFallbackDnsServers(): string[] {
  const fromEnv = process.env.MONGODB_DNS_SERVERS;
  if (!fromEnv) {
    return ['8.8.8.8', '1.1.1.1'];
  }

  return fromEnv
    .split(',')
    .map((server) => server.trim())
    .filter(Boolean);
}

function isSrvDnsError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes('querySrv') || message.includes('ENOTFOUND') || message.includes('ECONNREFUSED');
}

export async function connectDatabase(): Promise<void> {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI environment variable is not set. Please add it to your .env file.');
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri, {
      dbName: 'portfolio_db',
      serverSelectionTimeoutMS: 15000,
      family: 4,
    });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    const mongoUri = process.env.MONGO_URI;
    const canRetryWithDns = Boolean(mongoUri?.startsWith('mongodb+srv://')) && isSrvDnsError(error);

    if (canRetryWithDns) {
      const fallbackServers = getFallbackDnsServers();
      try {
        console.warn('⚠️  SRV DNS lookup failed. Retrying with fallback DNS servers:', fallbackServers.join(', '));
        dns.setServers(fallbackServers);
        await mongoose.connect(mongoUri!, {
          dbName: 'portfolio_db',
          serverSelectionTimeoutMS: 15000,
          family: 4,
        });
        console.log('✅ MongoDB connected successfully (fallback DNS)');
        return;
      } catch (retryError) {
        const retryMsg = retryError instanceof Error ? retryError.message : String(retryError);
        console.error('❌ MongoDB retry failed:', retryMsg);
      }
    }

    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('❌ MongoDB connection failed:', errorMsg);
    console.error('⚠️  Make sure:');
    console.error('   1. MONGO_URI is set in your .env file');
    console.error('   2. DNS can resolve MongoDB SRV records');
    console.error('   3. Connection string is valid');
    console.error('   4. Optionally set MONGODB_DNS_SERVERS=8.8.8.8,1.1.1.1');
    process.exit(1);
  }
}
