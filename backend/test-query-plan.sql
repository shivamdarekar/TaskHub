-- Test query execution plan for getWorkspaceOverview
-- Replace the projectId values with actual IDs from your database

EXPLAIN ANALYZE
SELECT 
    DATE("createdAt") as date,
    COUNT(*)::int as count
FROM "Task"
WHERE "projectId" IN ('15efb7aa-e551-4803-b03b-5866bac616ba')
    AND "createdAt" >= '2026-02-27 00:00:00'
GROUP BY DATE("createdAt")
ORDER BY date ASC;
