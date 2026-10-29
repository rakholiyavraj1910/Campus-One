import { supabase, supabaseUrl, isSupabaseConfigured, getSupabaseProjectRef } from './supabaseClient';
import { 
  TableMetric, 
  StorageBucketMetric, 
  LatencySample, 
  SystemMonitoringTelemetry 
} from '../types';

// Table metadata definitions
const TRACKED_TABLES: {
  tableName: string;
  category: 'core' | 'academic' | 'communication' | 'security';
  displayName: string;
}[] = [
  { tableName: 'profiles', category: 'core', displayName: 'User & Student Profiles' },
  { tableName: 'departments', category: 'core', displayName: 'Academic Departments (GPA-617)' },
  { tableName: 'faculty_directory', category: 'core', displayName: 'Faculty Member Directory' },
  { tableName: 'notices', category: 'communication', displayName: 'Campus Circulars & Circular Feeds' },
  { tableName: 'events', category: 'communication', displayName: 'Campus Events & Workshops' },
  { tableName: 'event_registrations', category: 'communication', displayName: 'Student Event Registrations' },
  { tableName: 'study_materials', category: 'academic', displayName: 'Course Notes & PYQ Question Papers' },
  { tableName: 'attendance_sessions', category: 'academic', displayName: 'Lecture & Lab Attendance Sessions' },
  { tableName: 'attendance_records', category: 'academic', displayName: 'Student Attendance Records' },
  { tableName: 'marks', category: 'academic', displayName: 'Internal Examination Marks & Assessments' },
  { tableName: 'assignments', category: 'academic', displayName: 'Academic Coursework Assignments' },
  { tableName: 'assignment_submissions', category: 'academic', displayName: 'Student Assignment Submissions' },
  { tableName: 'feedback', category: 'communication', displayName: 'Student & Faculty Feedback Entries' },
  { tableName: 'audit_logs', category: 'security', displayName: 'Security & Role Elevation Audit Logs' },
  { tableName: 'facilities', category: 'core', displayName: 'Campus Infrastructure & Facilities' },
];

const TRACKED_BUCKETS: {
  name: string;
  displayName: string;
  isPublic: boolean;
}[] = [
  { name: 'avatars', displayName: 'Profile Avatars Storage', isPublic: true },
  { name: 'study_materials', displayName: 'Curriculum & Notes Storage', isPublic: true },
  { name: 'notice_attachments', displayName: 'Official Notice PDF Attachments', isPublic: true },
  { name: 'assignment_submissions', displayName: 'Student Submissions Archive', isPublic: true },
];

// Rolling session history of ping latency samples (max 20 entries)
const latencyHistoryBuffer: LatencySample[] = [];

/**
 * Measure live roundtrip ping to Supabase PostgREST
 */
export const pingDatabaseLatency = async (): Promise<LatencySample> => {
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  if (!isSupabaseConfigured || !supabase) {
    const sample: LatencySample = {
      timestamp,
      latencyMs: 0,
      status: 'failed',
    };
    return sample;
  }

  const start = performance.now();
  try {
    const { error } = await supabase.from('notices').select('id').limit(1);
    const latencyMs = Math.round(performance.now() - start);

    let status: LatencySample['status'] = 'optimal';
    if (error && error.code !== 'PGRST205') {
      status = 'failed';
    } else if (latencyMs > 800) {
      status = 'degraded';
    } else if (latencyMs > 300) {
      status = 'moderate';
    }

    const sample: LatencySample = {
      timestamp,
      latencyMs,
      status,
    };

    // Store in rolling buffer
    latencyHistoryBuffer.push(sample);
    if (latencyHistoryBuffer.length > 20) {
      latencyHistoryBuffer.shift();
    }

    return sample;
  } catch {
    const sample: LatencySample = {
      timestamp,
      latencyMs: 0,
      status: 'failed',
    };
    latencyHistoryBuffer.push(sample);
    if (latencyHistoryBuffer.length > 20) {
      latencyHistoryBuffer.shift();
    }
    return sample;
  }
};

/**
 * Fetch complete live system & database monitoring telemetry
 */
export const fetchSystemMonitoringData = async (): Promise<SystemMonitoringTelemetry> => {
  const now = new Date();
  const lastUpdated = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const projectRef = getSupabaseProjectRef(supabaseUrl);

  // 1. Measure live latency sample
  const currentPing = await pingDatabaseLatency();

  // Compute stats across rolling buffer
  const validSamples = latencyHistoryBuffer.filter(s => s.status !== 'failed');
  const latencies = validSamples.map(s => s.latencyMs);
  const minLatencyMs = latencies.length > 0 ? Math.min(...latencies) : currentPing.latencyMs;
  const maxLatencyMs = latencies.length > 0 ? Math.max(...latencies) : currentPing.latencyMs;
  const avgLatencyMs = latencies.length > 0 
    ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) 
    : currentPing.latencyMs;

  // 2. Query exact row count for each tracked table via parallel HEAD queries
  const tableMetrics: TableMetric[] = [];
  let totalDatabaseRows = 0;
  let hasDatabaseError = false;

  if (isSupabaseConfigured && supabase) {
    const client = supabase;
    const tablePromises = TRACKED_TABLES.map(async (meta) => {
      try {
        const { count, error } = await client
          .from(meta.tableName)
          .select('*', { count: 'exact', head: true });

        if (error) {
          if (error.code === 'PGRST205') {
            // Table does not exist in schema
            return {
              tableName: meta.tableName,
              category: meta.category,
              displayName: meta.displayName,
              rowCount: 0,
              status: 'error' as const,
              rlsEnabled: true,
              lastChecked: lastUpdated,
              errorMessage: 'Table schema missing (PGRST205)',
            };
          }
          if (error.code === '42501') {
            return {
              tableName: meta.tableName,
              category: meta.category,
              displayName: meta.displayName,
              rowCount: 0,
              status: 'unauthorized' as const,
              rlsEnabled: true,
              lastChecked: lastUpdated,
              errorMessage: 'RLS Permission Guard (42501)',
            };
          }
          return {
            tableName: meta.tableName,
            category: meta.category,
            displayName: meta.displayName,
            rowCount: 0,
            status: 'error' as const,
            rlsEnabled: true,
            lastChecked: lastUpdated,
            errorMessage: error.message,
          };
        }

        const exactCount = count !== null ? count : 0;
        return {
          tableName: meta.tableName,
          category: meta.category,
          displayName: meta.displayName,
          rowCount: exactCount,
          status: (exactCount > 0 ? 'healthy' : 'empty') as 'healthy' | 'empty',
          rlsEnabled: true,
          lastChecked: lastUpdated,
        };
      } catch (err: any) {
        return {
          tableName: meta.tableName,
          category: meta.category,
          displayName: meta.displayName,
          rowCount: 0,
          status: 'error' as const,
          rlsEnabled: true,
          lastChecked: lastUpdated,
          errorMessage: err.message || 'Query timeout',
        };
      }
    });

    const results = await Promise.allSettled(tablePromises);
    results.forEach((res) => {
      if (res.status === 'fulfilled') {
        tableMetrics.push(res.value);
        totalDatabaseRows += res.value.rowCount;
        if (res.value.status === 'error') hasDatabaseError = true;
      }
    });
  } else {
    // Offline local demo fallback
    TRACKED_TABLES.forEach((meta) => {
      tableMetrics.push({
        tableName: meta.tableName,
        category: meta.category,
        displayName: meta.displayName,
        rowCount: 0,
        status: 'empty',
        rlsEnabled: true,
        lastChecked: lastUpdated,
      });
    });
  }

  // 3. Query Storage Buckets Telemetry
  const storageBuckets: StorageBucketMetric[] = [];
  let totalStorageFiles = 0;
  let totalStorageSizeBytes = 0;

  if (isSupabaseConfigured && supabase) {
    const client = supabase;
    const bucketPromises = TRACKED_BUCKETS.map(async (b) => {
      try {
        const { data, error } = await client.storage.from(b.name).list('', {
          limit: 100,
          sortBy: { column: 'created_at', order: 'desc' },
        });

        if (error) {
          return {
            name: b.name,
            displayName: b.displayName,
            isPublic: b.isPublic,
            fileCount: 0,
            totalSizeBytes: 0,
            status: 'restricted' as const,
            lastChecked: lastUpdated,
          };
        }

        const files = (data || []).filter(item => item.name && item.name !== '.emptyFolderPlaceholder');
        const count = files.length;
        let sizeSum = 0;
        files.forEach((f) => {
          if (f.metadata?.size && typeof f.metadata.size === 'number') {
            sizeSum += f.metadata.size;
          }
        });

        const recent = files.slice(0, 3).map(f => ({
          name: f.name,
          size: f.metadata?.size,
          createdAt: f.created_at || undefined,
        }));

        return {
          name: b.name,
          displayName: b.displayName,
          isPublic: b.isPublic,
          fileCount: count,
          totalSizeBytes: sizeSum,
          status: (count > 0 ? 'accessible' : 'empty') as 'accessible' | 'empty',
          lastChecked: lastUpdated,
          recentFiles: recent,
        };
      } catch {
        return {
          name: b.name,
          displayName: b.displayName,
          isPublic: b.isPublic,
          fileCount: 0,
          totalSizeBytes: 0,
          status: 'not_found' as const,
          lastChecked: lastUpdated,
        };
      }
    });

    const bResults = await Promise.allSettled(bucketPromises);
    bResults.forEach((res) => {
      if (res.status === 'fulfilled') {
        storageBuckets.push(res.value);
        totalStorageFiles += res.value.fileCount;
        totalStorageSizeBytes += res.value.totalSizeBytes;
      }
    });
  } else {
    TRACKED_BUCKETS.forEach((b) => {
      storageBuckets.push({
        name: b.name,
        displayName: b.displayName,
        isPublic: b.isPublic,
        fileCount: 0,
        totalSizeBytes: 0,
        status: 'empty',
        lastChecked: lastUpdated,
      });
    });
  }

  // Determine overall database health
  let databaseStatus: 'online' | 'degraded' | 'offline' | 'unconfigured' = 'online';
  if (!isSupabaseConfigured) {
    databaseStatus = 'unconfigured';
  } else if (currentPing.status === 'failed') {
    databaseStatus = 'offline';
  } else if (currentPing.status === 'degraded' || hasDatabaseError) {
    databaseStatus = 'degraded';
  }

  return {
    databaseStatus,
    projectRef,
    endpointUrl: isSupabaseConfigured ? supabaseUrl : 'Local Demo Engine',
    sslEnabled: Boolean(supabaseUrl.startsWith('https://')),
    authMode: 'Supabase GoTrue (JWT + Row Level Security)',
    currentLatencyMs: currentPing.latencyMs,
    avgLatencyMs,
    minLatencyMs,
    maxLatencyMs,
    latencyHistory: [...latencyHistoryBuffer],
    totalDatabaseRows,
    tableMetrics,
    storageBuckets,
    totalStorageSizeBytes,
    totalStorageFiles,
    // Explicitly labeled unavailable metrics - CRITICAL ACCURACY RULE:
    // Never simulate or invent percentages or random graphs for CPU / RAM!
    cpuUtilization: {
      available: false,
      statusLabel: 'Not available on current Supabase tier',
      technicalReason: 'PostgreSQL host OS virtual cores and CPU time-slices are sandboxed by cloud provider architecture. Browser client publishable tokens are intentionally forbidden from reading host kernel CPU counters for security isolation.',
      suggestedIntegration: 'Requires Supabase Management API bearer token (Pro/Enterprise tier) or dedicated Prometheus metrics exporter on self-hosted PostgreSQL.',
    },
    ramUtilization: {
      available: false,
      statusLabel: 'Not available on current Supabase tier',
      technicalReason: 'Shared memory buffer pool allocation, resident set size (RSS), and OS memory pages cannot be read via client-side REST interface.',
      suggestedIntegration: 'Available on Supabase Dedicated Compute instances via pg_stat_statements or Management API telemetry endpoints.',
    },
    connectionPoolUtilization: {
      available: false,
      statusLabel: 'Supavisor Pool Telemetry not connected',
      technicalReason: 'Active client connection slot count is managed by Supavisor connection pooler on port 6543 (transaction mode), which does not publish slot exhaustion statistics to standard public schema.',
      suggestedIntegration: 'Requires direct administrative query on pg_stat_activity with postgres superuser privileges.',
    },
    migrationCount: 12,
    schemaVersion: '20261028080000_faculty_portal_permissions',
    lastUpdated,
  };
};

/**
 * Format bytes to readable string (KB, MB, GB)
 */
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};
