-- ============================================
-- Database Per Service Schema Isolation - FIXED
-- Phase 1.3: Create separate schemas for each microservice
-- ============================================

-- Create separate schemas for each service
CREATE SCHEMA IF NOT EXISTS assets_service;
CREATE SCHEMA IF NOT EXISTS workorder_service;
CREATE SCHEMA IF NOT EXISTS inventory_service;
CREATE SCHEMA IF NOT EXISTS people_service;
CREATE SCHEMA IF NOT EXISTS safety_service;

-- Grant usage on schemas to authenticated users
GRANT USAGE ON SCHEMA assets_service TO authenticated;
GRANT USAGE ON SCHEMA workorder_service TO authenticated;
GRANT USAGE ON SCHEMA inventory_service TO authenticated;
GRANT USAGE ON SCHEMA people_service TO authenticated;
GRANT USAGE ON SCHEMA safety_service TO authenticated;

-- ============================================
-- ASSETS SERVICE SCHEMA
-- Move asset-related tables
-- ============================================

ALTER TABLE public.assets SET SCHEMA assets_service;
ALTER TABLE public.asset_documents SET SCHEMA assets_service;
ALTER TABLE public.asset_boms SET SCHEMA assets_service;
ALTER TABLE public.asset_meter_groups SET SCHEMA assets_service;
ALTER TABLE public.asset_skill_requirements SET SCHEMA assets_service;
ALTER TABLE public.hierarchy_levels SET SCHEMA assets_service;
ALTER TABLE public.hierarchy_nodes SET SCHEMA assets_service;

-- Create backward compatibility views in public schema
CREATE OR REPLACE VIEW public.assets AS SELECT * FROM assets_service.assets;
CREATE OR REPLACE VIEW public.asset_documents AS SELECT * FROM assets_service.asset_documents;
CREATE OR REPLACE VIEW public.asset_boms AS SELECT * FROM assets_service.asset_boms;
CREATE OR REPLACE VIEW public.asset_meter_groups AS SELECT * FROM assets_service.asset_meter_groups;
CREATE OR REPLACE VIEW public.asset_skill_requirements AS SELECT * FROM assets_service.asset_skill_requirements;
CREATE OR REPLACE VIEW public.hierarchy_levels AS SELECT * FROM assets_service.hierarchy_levels;
CREATE OR REPLACE VIEW public.hierarchy_nodes AS SELECT * FROM assets_service.hierarchy_nodes;

-- ============================================
-- WORK ORDER SERVICE SCHEMA
-- Move work order, job plan, and PM related tables
-- ============================================

ALTER TABLE public.work_orders SET SCHEMA workorder_service;
ALTER TABLE public.job_plans SET SCHEMA workorder_service;
ALTER TABLE public.job_plan_tasks SET SCHEMA workorder_service;
ALTER TABLE public.job_plan_parts SET SCHEMA workorder_service;
ALTER TABLE public.job_plan_tools SET SCHEMA workorder_service;
ALTER TABLE public.job_plan_documents SET SCHEMA workorder_service;
ALTER TABLE public.job_plan_task_skills SET SCHEMA workorder_service;
ALTER TABLE public.pm_schedules SET SCHEMA workorder_service;
ALTER TABLE public.pm_schedule_assignments SET SCHEMA workorder_service;
ALTER TABLE public.pm_schedule_materials SET SCHEMA workorder_service;
ALTER TABLE public.maintenance_routes SET SCHEMA workorder_service;
ALTER TABLE public.route_assets SET SCHEMA workorder_service;
ALTER TABLE public.work_order_skill_requirements SET SCHEMA workorder_service;

-- Create backward compatibility views
CREATE OR REPLACE VIEW public.work_orders AS SELECT * FROM workorder_service.work_orders;
CREATE OR REPLACE VIEW public.job_plans AS SELECT * FROM workorder_service.job_plans;
CREATE OR REPLACE VIEW public.job_plan_tasks AS SELECT * FROM workorder_service.job_plan_tasks;
CREATE OR REPLACE VIEW public.job_plan_parts AS SELECT * FROM workorder_service.job_plan_parts;
CREATE OR REPLACE VIEW public.job_plan_tools AS SELECT * FROM workorder_service.job_plan_tools;
CREATE OR REPLACE VIEW public.job_plan_documents AS SELECT * FROM workorder_service.job_plan_documents;
CREATE OR REPLACE VIEW public.job_plan_task_skills AS SELECT * FROM workorder_service.job_plan_task_skills;
CREATE OR REPLACE VIEW public.pm_schedules AS SELECT * FROM workorder_service.pm_schedules;
CREATE OR REPLACE VIEW public.pm_schedule_assignments AS SELECT * FROM workorder_service.pm_schedule_assignments;
CREATE OR REPLACE VIEW public.pm_schedule_materials AS SELECT * FROM workorder_service.pm_schedule_materials;
CREATE OR REPLACE VIEW public.maintenance_routes AS SELECT * FROM workorder_service.maintenance_routes;
CREATE OR REPLACE VIEW public.route_assets AS SELECT * FROM workorder_service.route_assets;
CREATE OR REPLACE VIEW public.work_order_skill_requirements AS SELECT * FROM workorder_service.work_order_skill_requirements;

-- ============================================
-- INVENTORY SERVICE SCHEMA
-- Move inventory-related tables
-- ============================================

ALTER TABLE public.inventory_items SET SCHEMA inventory_service;
ALTER TABLE public.inventory_locations SET SCHEMA inventory_service;
ALTER TABLE public.inventory_item_locations SET SCHEMA inventory_service;
ALTER TABLE public.inventory_transactions SET SCHEMA inventory_service;
ALTER TABLE public.inventory_transfers SET SCHEMA inventory_service;
ALTER TABLE public.inventory_transfer_items SET SCHEMA inventory_service;
ALTER TABLE public.inventory_loans SET SCHEMA inventory_service;
ALTER TABLE public.suppliers SET SCHEMA inventory_service;
ALTER TABLE public.bill_of_materials SET SCHEMA inventory_service;
ALTER TABLE public.bom_items SET SCHEMA inventory_service;

-- Create backward compatibility views
CREATE OR REPLACE VIEW public.inventory_items AS SELECT * FROM inventory_service.inventory_items;
CREATE OR REPLACE VIEW public.inventory_locations AS SELECT * FROM inventory_service.inventory_locations;
CREATE OR REPLACE VIEW public.inventory_item_locations AS SELECT * FROM inventory_service.inventory_item_locations;
CREATE OR REPLACE VIEW public.inventory_transactions AS SELECT * FROM inventory_service.inventory_transactions;
CREATE OR REPLACE VIEW public.inventory_transfers AS SELECT * FROM inventory_service.inventory_transfers;
CREATE OR REPLACE VIEW public.inventory_transfer_items AS SELECT * FROM inventory_service.inventory_transfer_items;
CREATE OR REPLACE VIEW public.inventory_loans AS SELECT * FROM inventory_service.inventory_loans;
CREATE OR REPLACE VIEW public.suppliers AS SELECT * FROM inventory_service.suppliers;
CREATE OR REPLACE VIEW public.bill_of_materials AS SELECT * FROM inventory_service.bill_of_materials;
CREATE OR REPLACE VIEW public.bom_items AS SELECT * FROM inventory_service.bom_items;

-- ============================================
-- PEOPLE SERVICE SCHEMA
-- Move people and labor-related tables
-- ============================================

ALTER TABLE public.people SET SCHEMA people_service;
ALTER TABLE public.teams SET SCHEMA people_service;
ALTER TABLE public.team_members SET SCHEMA people_service;
ALTER TABLE public.skills SET SCHEMA people_service;
ALTER TABLE public.person_skills SET SCHEMA people_service;
ALTER TABLE public.crafts SET SCHEMA people_service;
ALTER TABLE public.person_crafts SET SCHEMA people_service;
ALTER TABLE public.person_business_areas SET SCHEMA people_service;

-- Create backward compatibility views
CREATE OR REPLACE VIEW public.people AS SELECT * FROM people_service.people;
CREATE OR REPLACE VIEW public.teams AS SELECT * FROM people_service.teams;
CREATE OR REPLACE VIEW public.team_members AS SELECT * FROM people_service.team_members;
CREATE OR REPLACE VIEW public.skills AS SELECT * FROM people_service.skills;
CREATE OR REPLACE VIEW public.person_skills AS SELECT * FROM people_service.person_skills;
CREATE OR REPLACE VIEW public.crafts AS SELECT * FROM people_service.crafts;
CREATE OR REPLACE VIEW public.person_crafts AS SELECT * FROM people_service.person_crafts;
CREATE OR REPLACE VIEW public.person_business_areas AS SELECT * FROM people_service.person_business_areas;

-- ============================================
-- SAFETY SERVICE SCHEMA
-- Move safety and compliance-related tables
-- ============================================

ALTER TABLE public.safety_incidents SET SCHEMA safety_service;
ALTER TABLE public.safety_precautions SET SCHEMA safety_service;
ALTER TABLE public.capa_records SET SCHEMA safety_service;

-- Create backward compatibility views
CREATE OR REPLACE VIEW public.safety_incidents AS SELECT * FROM safety_service.safety_incidents;
CREATE OR REPLACE VIEW public.safety_precautions AS SELECT * FROM safety_service.safety_precautions;
CREATE OR REPLACE VIEW public.capa_records AS SELECT * FROM safety_service.capa_records;

-- ============================================
-- Grant permissions on new schemas
-- ============================================

GRANT ALL ON ALL TABLES IN SCHEMA assets_service TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA workorder_service TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA inventory_service TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA people_service TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA safety_service TO authenticated;

-- Grant permissions on views
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;

COMMENT ON SCHEMA assets_service IS 'Assets Management Service - owns asset and hierarchy data';
COMMENT ON SCHEMA workorder_service IS 'Work Order Service - owns work orders, job plans, and PM schedules';
COMMENT ON SCHEMA inventory_service IS 'Inventory Service - owns inventory items, locations, and transactions';
COMMENT ON SCHEMA people_service IS 'People & Labor Service - owns people, teams, skills, and crafts';
COMMENT ON SCHEMA safety_service IS 'Safety & Compliance Service - owns incidents, precautions, and CAPA records';