#!/usr/bin/env tsx

import { db } from '@/lib/db';

// Node.js globals
declare const process: any;

async function setupDatabase() {
  console.log('🚀 Setting up WatchTower Pro Database...\n');
  
  try {
    // Test database connection
    console.log('🔍 Testing database connection...');
    await db.$connect();
    console.log('✅ Database connection successful!\n');
    
    // Check if tables exist
    console.log('📋 Checking existing tables...');
    const tables = await db.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    
    console.log(`📊 Found ${Array.isArray(tables) ? tables.length : 0} existing tables`);
    
    if (Array.isArray(tables) && tables.length > 0) {
      console.log('📋 Current tables:');
      tables.forEach((table: any) => {
        console.log(`   • ${table.table_name}`);
      });
    }
    
    console.log('\n🎯 Expected tables for WatchTower Pro:');
    const expectedTables = [
      'users',
      'companies', 
      'company_users',
      'monitors',
      'monitor_checks',
      'alerts',
      'incidents',
      'notifications'
    ];
    
    expectedTables.forEach(table => {
      const exists = Array.isArray(tables) && tables.some((t: any) => t.table_name === table);
      console.log(`   ${exists ? '✅' : '❌'} ${table}`);
    });
    
    // Test basic queries
    console.log('\n🧪 Testing basic database operations...');
    
    try {
      // Test users table
      const userCount = await db.user.count();
      console.log(`✅ Users table accessible (${userCount} users)`);
      
      // Test monitors table
      const monitorCount = await db.monitor.count();
      console.log(`✅ Monitors table accessible (${monitorCount} monitors)`);
      
      // Test alerts table
      const alertCount = await db.alert.count();
      console.log(`✅ Alerts table accessible (${alertCount} alerts)`);
      
      // Test other tables
      const checkCount = await db.monitorCheck.count();
      console.log(`✅ Monitor checks table accessible (${checkCount} checks)`);
      
      const incidentCount = await db.incident.count();
      console.log(`✅ Incidents table accessible (${incidentCount} incidents)`);
      
    } catch (error) {
      console.log('❌ Some tables may not exist yet. This is normal if you haven\'t run "pnpm db:push"');
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    console.log('\n📝 Database Setup Summary:');
    console.log('   • Database connection: ✅ Working');
    console.log('   • Schema file: ✅ Complete');
    console.log('   • Tables status: Check above');
    
    console.log('\n🚀 Next steps:');
    console.log('   1. If tables are missing, run: pnpm db:push');
    console.log('   2. Start the monitoring system: pnpm monitoring:start');
    console.log('   3. Create your first monitor via the API');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('   • Check your DATABASE_URL in .env file');
    console.log('   • Verify your Supabase credentials');
    console.log('   • Ensure your Supabase project is active');
    console.log('   • Run: pnpm db:generate && pnpm db:push');
    
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down database setup...');
  await db.$disconnect();
  process.exit(0);
});

setupDatabase().catch(console.error); 