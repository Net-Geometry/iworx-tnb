-- ============================================
-- Fix Security Issues with Compatibility Views
-- Make views use SECURITY INVOKER instead of SECURITY DEFINER
-- ============================================

-- Drop and recreate all views with SECURITY INVOKER
-- This ensures views use the querying user's permissions, not the creator's

-- Assets Service Views
DROP VIEW IF EXISTS public.assets CASCADE;
DROP VIEW IF EXISTS public.asset_documents CASCADE;
DROP VIEW IF EXISTS public.asset_boms CASCADE;
DROP VIEW IF EXISTS public.asset_meter_groups CASCADE;
DROP VIEW IF EXISTS public.asset_skill_requirements CASCADE;
DROP VIEW IF EXISTS public.hierarchy_levels CASCADE;
DROP VIEW IF EXISTS public.hierarchy_nodes CASCADE;

CREATE VIEW public.assets WITH (security_invoker = true) AS SELECT * FROM assets_service.assets;
CREATE VIEW public.asset_documents WITH (security_invoker = true) AS SELECT * FROM assets_service.asset_documents;
CREATE VIEW public.asset_boms WITH (security_invoker = true) AS SELECT * FROM assets_service.asset_boms;
CREATE VIEW public.asset_meter_groups WITH (security_invoker = true) AS SELECT * FROM assets_service.asset_meter_groups;
CREATE VIEW public.asset_skill_requirements WITH (security_invoker = true) AS SELECT * FROM assets_service.asset_skill_requirements;
CREATE VIEW public.hierarchy_levels WITH (security_invoker = true) AS SELECT * FROM assets_service.hierarchy_levels;
CREATE VIEW public.hierarchy_nodes WITH (security_invoker = true) AS SELECT * FROM assets_service.hierarchy_nodes;

-- Work Order Service Views
DROP VIEW IF EXISTS public.work_orders CASCADE;
DROP VIEW IF EXISTS public.job_plans CASCADE;
DROP VIEW IF EXISTS public.job_plan_tasks CASCADE;
DROP VIEW IF EXISTS public.job_plan_parts CASCADE;
DROP VIEW IF EXISTS public.job_plan_tools CASCADE;
DROP VIEW IF EXISTS public.job_plan_documents CASCADE;
DROP VIEW IF EXISTS public.job_plan_task_skills CASCADE;
DROP VIEW IF EXISTS public.pm_schedules CASCADE;
DROP VIEW IF EXISTS public.pm_schedule_assignments CASCADE;
DROP VIEW IF EXISTS public.pm_schedule_materials CASCADE;
DROP VIEW IF EXISTS public.maintenance_routes CASCADE;
DROP VIEW IF EXISTS public.route_assets CASCADE;
DROP VIEW IF EXISTS public.work_order_skill_requirements CASCADE;

CREATE VIEW public.work_orders WITH (security_invoker = true) AS SELECT * FROM workorder_service.work_orders;
CREATE VIEW public.job_plans WITH (security_invoker = true) AS SELECT * FROM workorder_service.job_plans;
CREATE VIEW public.job_plan_tasks WITH (security_invoker = true) AS SELECT * FROM workorder_service.job_plan_tasks;
CREATE VIEW public.job_plan_parts WITH (security_invoker = true) AS SELECT * FROM workorder_service.job_plan_parts;
CREATE VIEW public.job_plan_tools WITH (security_invoker = true) AS SELECT * FROM workorder_service.job_plan_tools;
CREATE VIEW public.job_plan_documents WITH (security_invoker = true) AS SELECT * FROM workorder_service.job_plan_documents;
CREATE VIEW public.job_plan_task_skills WITH (security_invoker = true) AS SELECT * FROM workorder_service.job_plan_task_skills;
CREATE VIEW public.pm_schedules WITH (security_invoker = true) AS SELECT * FROM workorder_service.pm_schedules;
CREATE VIEW public.pm_schedule_assignments WITH (security_invoker = true) AS SELECT * FROM workorder_service.pm_schedule_assignments;
CREATE VIEW public.pm_schedule_materials WITH (security_invoker = true) AS SELECT * FROM workorder_service.pm_schedule_materials;
CREATE VIEW public.maintenance_routes WITH (security_invoker = true) AS SELECT * FROM workorder_service.maintenance_routes;
CREATE VIEW public.route_assets WITH (security_invoker = true) AS SELECT * FROM workorder_service.route_assets;
CREATE VIEW public.work_order_skill_requirements WITH (security_invoker = true) AS SELECT * FROM workorder_service.work_order_skill_requirements;

-- Inventory Service Views
DROP VIEW IF EXISTS public.inventory_items CASCADE;
DROP VIEW IF EXISTS public.inventory_locations CASCADE;
DROP VIEW IF EXISTS public.inventory_item_locations CASCADE;
DROP VIEW IF EXISTS public.inventory_transactions CASCADE;
DROP VIEW IF EXISTS public.inventory_transfers CASCADE;
DROP VIEW IF EXISTS public.inventory_transfer_items CASCADE;
DROP VIEW IF EXISTS public.inventory_loans CASCADE;
DROP VIEW IF EXISTS public.suppliers CASCADE;
DROP VIEW IF EXISTS public.bill_of_materials CASCADE;
DROP VIEW IF EXISTS public.bom_items CASCADE;

CREATE VIEW public.inventory_items WITH (security_invoker = true) AS SELECT * FROM inventory_service.inventory_items;
CREATE VIEW public.inventory_locations WITH (security_invoker = true) AS SELECT * FROM inventory_service.inventory_locations;
CREATE VIEW public.inventory_item_locations WITH (security_invoker = true) AS SELECT * FROM inventory_service.inventory_item_locations;
CREATE VIEW public.inventory_transactions WITH (security_invoker = true) AS SELECT * FROM inventory_service.inventory_transactions;
CREATE VIEW public.inventory_transfers WITH (security_invoker = true) AS SELECT * FROM inventory_service.inventory_transfers;
CREATE VIEW public.inventory_transfer_items WITH (security_invoker = true) AS SELECT * FROM inventory_service.inventory_transfer_items;
CREATE VIEW public.inventory_loans WITH (security_invoker = true) AS SELECT * FROM inventory_service.inventory_loans;
CREATE VIEW public.suppliers WITH (security_invoker = true) AS SELECT * FROM inventory_service.suppliers;
CREATE VIEW public.bill_of_materials WITH (security_invoker = true) AS SELECT * FROM inventory_service.bill_of_materials;
CREATE VIEW public.bom_items WITH (security_invoker = true) AS SELECT * FROM inventory_service.bom_items;

-- People Service Views
DROP VIEW IF EXISTS public.people CASCADE;
DROP VIEW IF EXISTS public.teams CASCADE;
DROP VIEW IF EXISTS public.team_members CASCADE;
DROP VIEW IF EXISTS public.skills CASCADE;
DROP VIEW IF EXISTS public.person_skills CASCADE;
DROP VIEW IF EXISTS public.crafts CASCADE;
DROP VIEW IF EXISTS public.person_crafts CASCADE;
DROP VIEW IF EXISTS public.person_business_areas CASCADE;

CREATE VIEW public.people WITH (security_invoker = true) AS SELECT * FROM people_service.people;
CREATE VIEW public.teams WITH (security_invoker = true) AS SELECT * FROM people_service.teams;
CREATE VIEW public.team_members WITH (security_invoker = true) AS SELECT * FROM people_service.team_members;
CREATE VIEW public.skills WITH (security_invoker = true) AS SELECT * FROM people_service.skills;
CREATE VIEW public.person_skills WITH (security_invoker = true) AS SELECT * FROM people_service.person_skills;
CREATE VIEW public.crafts WITH (security_invoker = true) AS SELECT * FROM people_service.crafts;
CREATE VIEW public.person_crafts WITH (security_invoker = true) AS SELECT * FROM people_service.person_crafts;
CREATE VIEW public.person_business_areas WITH (security_invoker = true) AS SELECT * FROM people_service.person_business_areas;

-- Safety Service Views
DROP VIEW IF EXISTS public.safety_incidents CASCADE;
DROP VIEW IF EXISTS public.safety_precautions CASCADE;
DROP VIEW IF EXISTS public.capa_records CASCADE;

CREATE VIEW public.safety_incidents WITH (security_invoker = true) AS SELECT * FROM safety_service.safety_incidents;
CREATE VIEW public.safety_precautions WITH (security_invoker = true) AS SELECT * FROM safety_service.safety_precautions;
CREATE VIEW public.capa_records WITH (security_invoker = true) AS SELECT * FROM safety_service.capa_records;

-- Grant SELECT permissions on all views
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;

COMMENT ON VIEW public.assets IS 'Backward compatibility view - delegates to assets_service.assets with security_invoker';
COMMENT ON VIEW public.work_orders IS 'Backward compatibility view - delegates to workorder_service.work_orders with security_invoker';
COMMENT ON VIEW public.inventory_items IS 'Backward compatibility view - delegates to inventory_service.inventory_items with security_invoker';
COMMENT ON VIEW public.people IS 'Backward compatibility view - delegates to people_service.people with security_invoker';
COMMENT ON VIEW public.safety_incidents IS 'Backward compatibility view - delegates to safety_service.safety_incidents with security_invoker';