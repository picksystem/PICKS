// Seed tickets into the unified adminTicket table.
// Uses the same database setup pattern as the Prisma client.
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

function parseDbUrl(raw: string) {
  const u = new URL(raw);
  return {
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    host: u.hostname,
    port: parseInt(u.port, 10) || 5432,
    database: u.pathname.replace(/^\//, ''),
  };
}

const dbConfig = parseDbUrl(process.env.DATABASE_URL!);

const pool = new Pool({
  ...dbConfig,
  max: 10,
  min: 2,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  ssl: { rejectUnauthorized: false },
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding adminTicket records...');

  const deleted = await prisma.adminTicket.deleteMany({});
  console.log('Cleared existing tickets:', deleted.count);

  const tickets = [
    { ticketType:'incident', number:'INC0001001', client:'Internal', caller:'John Doe', callerPhone:'+1-555-0101', callerEmail:'john.doe@company.com', callerLocation:'NY HQ', callerDepartment:'Finance', businessCategory:'Financial Services', serviceLine:'Core Banking', application:'Payment Gateway', shortDescription:'Payment gateway returning timeout errors', description:'Multiple users experiencing timeout errors when processing payments.', impact:'high', urgency:'high', priority:'1-Critical', channel:'phone', status:'new', assignmentGroup:'Payment Support Team', primaryResource:'Alice Johnson', createdBy:'admin@serviceops.tech', isRecurring:false, notes:'Escalated to P1' },
    { ticketType:'incident', number:'INC0001002', client:'Internal', caller:'Jane Smith', callerPhone:'+1-555-0102', callerEmail:'jane.smith@company.com', callerLocation:'Chicago', callerDepartment:'Human Resources', businessCategory:'Corporate Services', serviceLine:'HR Systems', application:'Employee Portal', shortDescription:'Employee portal SSO login failing', description:'HR staff unable to access the employee portal via SSO.', impact:'medium', urgency:'high', priority:'2-High', channel:'email', status:'in_progress', assignmentGroup:'IAM Team', primaryResource:'Bob Williams', secondaryResources:'Carol Davis', createdBy:'admin@serviceops.tech', isRecurring:false, notes:'SAML config issue' },
    { ticketType:'incident', number:'INC0001003', client:'Internal', caller:'Mike Johnson', callerEmail:'mike.johnson@company.com', callerLocation:'Dallas Remote', callerDepartment:'Engineering', businessCategory:'Technology', serviceLine:'Infrastructure', application:'CI/CD Pipeline', shortDescription:'Builds failing intermittently', description:'Build pipeline failing ~30% of the time.', impact:'medium', urgency:'medium', priority:'3-Medium', channel:'portal', status:'on_hold', assignmentGroup:'DevOps Team', primaryResource:'Dave Martinez', createdBy:'user@serviceops.tech', isRecurring:true, notes:'Waiting for new agents' },
    { ticketType:'incident', number:'INC0001004', client:'Internal', caller:'Sarah Wilson', callerPhone:'+1-555-0104', callerEmail:'sarah.wilson@company.com', callerLocation:'SF Office', callerDepartment:'Marketing', businessCategory:'Marketing', serviceLine:'Digital Marketing', application:'Email Campaign Tool', shortDescription:'Marketing emails bouncing at high rate', description:'40% bounce rate due to DNS SPF misconfiguration.', impact:'low', urgency:'medium', priority:'4-Low', channel:'chat', status:'resolved', assignmentGroup:'Email Infra', primaryResource:'Eve Rodriguez', createdBy:'user@serviceops.tech', isRecurring:false, notes:'SPF fixed' },
    { ticketType:'incident', number:'INC0001005', client:'Internal', caller:'Tom Brown', callerPhone:'+1-555-0105', callerEmail:'tom.brown@company.com', callerLocation:'Boston', callerDepartment:'Sales', businessCategory:'Sales Ops', serviceLine:'CRM', application:'Salesforce', shortDescription:'CRM-ERP sync failing', description:'Salesforce-ERP sync failing since maintenance window.', impact:'high', urgency:'medium', priority:'2-High', channel:'phone', status:'closed', assignmentGroup:'Integration', primaryResource:'Frank Lee', secondaryResources:'Grace Kim', createdBy:'admin@serviceops.tech', isRecurring:false, notes:'Closed after monitoring' },
    { ticketType:'service_request', number:'SR0001001', client:'Internal', caller:'Lisa Chen', callerEmail:'lisa.chen@company.com', callerLocation:'Seattle Remote', callerDepartment:'Engineering', businessCategory:'Technology', serviceLine:'Dev', application:'Jira', shortDescription:'Request new Jira project board', description:'Need a new Kanban board for the mobile team.', impact:'low', urgency:'low', priority:'4-Low', channel:'portal', status:'new', assignmentGroup:'IT Provisioning', primaryResource:'Henry Adams', createdBy:'user@serviceops.tech', isRecurring:false, notes:'Standard request' },
    { ticketType:'service_request', number:'SR0001002', client:'Internal', caller:'David Park', callerEmail:'david.park@company.com', callerLocation:'Austin', callerDepartment:'Operations', businessCategory:'Operations', serviceLine:'Identity', application:'Active Directory', shortDescription:'VPN access for new contractor', description:'New contractor needs VPN access for 30 days.', impact:'low', urgency:'medium', priority:'3-Medium', channel:'email', status:'in_progress', assignmentGroup:'IAM Team', primaryResource:'Ivy Chen', createdBy:'admin@serviceops.tech', isRecurring:false, notes:'Pending approval' },
    { ticketType:'advisory_request', number:'AR0001001', client:'Internal', caller:'Karen Miller', callerEmail:'karen.miller@company.com', callerLocation:'Boston', callerDepartment:'Finance', businessCategory:'FS', serviceLine:'Compliance', application:'SOX Controls', shortDescription:'SOX compliance review advisory', description:'Need advisory on SOX controls for the new reporting system.', impact:'medium', urgency:'low', priority:'3-Medium', channel:'email', status:'in_progress', assignmentGroup:'GRC Advisory', primaryResource:'Liam Brown', createdBy:'admin@serviceops.tech', isRecurring:false, notes:'Meeting scheduled' },
  ];

  for (const t of tickets) {
    await prisma.adminTicket.create({ data: t as any });
    console.log(' +', t.number, '(' + t.ticketType + ')');
  }

  // Seed ticket types if not present
  const types = [
    { type:'incident', name:'Incident', displayName:'Incident', displayTag:'INC', shortDescription:'Unplanned interruption', description:'Service disruption', prefix:'INC', isActive:true, numberLength:7, displayOrder:1 },
    { type:'service_request', name:'Service Request', displayName:'Service Request', displayTag:'SR', shortDescription:'Formal request', description:'Service provisioning', prefix:'SR', isActive:true, numberLength:7, displayOrder:2 },
    { type:'advisory_request', name:'Advisory Request', displayName:'Advisory Request', displayTag:'AR', shortDescription:'Advisory request', description:'Guidance', prefix:'AR', isActive:true, numberLength:7, displayOrder:3 },
  ];
  for (const tt of types) {
    await prisma.adminTicketType.upsert({
      where: { type: tt.type },
      update: tt as any,
      create: tt as any,
    });
    console.log(' + ticket type:', tt.type);
  }

  const total = await prisma.adminTicket.count();
  const typeCount = await prisma.adminTicketType.count();
  console.log('\nTotal tickets:', total);
  console.log('Total ticket types:', typeCount);
}

main()
  .catch((e) => { console.error('Seed failed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); await pool.end(); });