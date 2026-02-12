import { PrismaClient } from '@prisma/client'

const project = 'rugaszeurphtkwzkxssu'
const pass1 = 'oL5Y0RshsUxPckhY' // Generated
const pass2 = 'Legolitas1!' // Old

const configs = [
    // Direct - Generated Pass
    { name: 'DIRECT (GenPass)', url: `postgresql://postgres:${pass1}@db.${project}.supabase.co:5432/postgres` },
    // Direct - Old Pass
    { name: 'DIRECT (OldPass)', url: `postgresql://postgres:${pass2}@db.${project}.supabase.co:5432/postgres` },

    // Pooled AWS-0 - Generated Pass
    { name: 'POOL-0 (GenPass)', url: `postgresql://postgres.${project}:${pass1}@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true` },
    // Pooled AWS-0 - Old Pass
    { name: 'POOL-0 (OldPass)', url: `postgresql://postgres.${project}:${pass2}@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true` },

    // Pooled AWS-1 - Generated Pass
    { name: 'POOL-1 (GenPass)', url: `postgresql://postgres.${project}:${pass1}@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true` },
]

async function testConnection(name: string, url: string) {
    const prisma = new PrismaClient({ datasources: { db: { url } } })
    try {
        console.log(`Testing ${name}...`)
        const start = Date.now()
        await prisma.user.count()
        console.log(`✅ ${name}: SUCCESS (${Date.now() - start}ms)`)
        return true
    } catch (e: any) {
        console.log(`❌ ${name}: FAILED - ${e.message.split('\n').pop()}`)
        return false
    } finally {
        await prisma.$disconnect()
    }
}

async function main() {
    for (const config of configs) {
        await testConnection(config.name, config.url)
    }
}

main()
