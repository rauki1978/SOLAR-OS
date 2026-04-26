-- Enable Row Level Security
ALTER TABLE "Organization" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Membership" ENABLE ROW LEVEL SECURITY;

-- Force RLS even for table owners
ALTER TABLE "Organization" FORCE ROW LEVEL SECURITY;
ALTER TABLE "User" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Membership" FORCE ROW LEVEL SECURITY;

-- Organization: visible only when its id matches the active org
CREATE POLICY "Organization_tenant_isolation" ON "Organization"
  FOR ALL
  USING (id = current_setting('app.current_org_id', true))
  WITH CHECK (id = current_setting('app.current_org_id', true));

-- Membership: visible only when its organizationId matches the active org
CREATE POLICY "Membership_tenant_isolation" ON "Membership"
  FOR ALL
  USING ("organizationId" = current_setting('app.current_org_id', true))
  WITH CHECK ("organizationId" = current_setting('app.current_org_id', true));

-- User: visible if linked via Membership to the active org
CREATE POLICY "User_tenant_isolation" ON "User"
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM "Membership" m
      WHERE m."userId" = "User".id
        AND m."organizationId" = current_setting('app.current_org_id', true)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Membership" m
      WHERE m."userId" = "User".id
        AND m."organizationId" = current_setting('app.current_org_id', true)
    )
  );
