CREATE TYPE "public"."account_token_type" AS ENUM('email_confirmation', 'password_reset');--> statement-breakpoint
CREATE TYPE "public"."appointment_source" AS ENUM('staff', 'portal');--> statement-breakpoint
CREATE TYPE "public"."appointment_status" AS ENUM('pending', 'confirmed', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."business_area" AS ENUM('clinic', 'grooming', 'laboratory');--> statement-breakpoint
CREATE TYPE "public"."employee_position" AS ENUM('veterinarian', 'groomer', 'receptionist');--> statement-breakpoint
CREATE TYPE "public"."field_binding" AS ENUM('client.name', 'client.phone', 'client.email', 'patient.name', 'patient.species', 'patient.breed', 'patient.age', 'patient.sex', 'patient.allergies', 'appointment.date', 'appointment.time', 'appointment.vet', 'appointment.reason');--> statement-breakpoint
CREATE TYPE "public"."field_type" AS ENUM('text', 'textarea', 'email', 'phone', 'number', 'date', 'time_slot', 'select', 'multiselect', 'checkbox');--> statement-breakpoint
CREATE TYPE "public"."options_source" AS ENUM('static', 'species', 'vets');--> statement-breakpoint
CREATE TYPE "public"."patient_sex" AS ENUM('male', 'female');--> statement-breakpoint
CREATE TYPE "public"."pay_method" AS ENUM('cash', 'card', 'transfer');--> statement-breakpoint
CREATE TYPE "public"."portal_purpose" AS ENUM('booking', 'capture');--> statement-breakpoint
CREATE TYPE "public"."portal_status" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TYPE "public"."product_category" AS ENUM('vaccines', 'medications', 'grooming', 'food', 'supplies');--> statement-breakpoint
CREATE TYPE "public"."rejection_reason" AS ENUM('slot_taken', 'outside_availability', 'max_per_day', 'portal_changed', 'portal_closed', 'duplicate');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('superadmin', 'owner', 'employee', 'public');--> statement-breakpoint
CREATE TYPE "public"."service_type" AS ENUM('veterinary', 'grooming', 'laboratory', 'medication', 'vaccine');--> statement-breakpoint
CREATE TYPE "public"."species" AS ENUM('dog', 'cat', 'bird', 'other');--> statement-breakpoint
CREATE TYPE "public"."submission_status" AS ENUM('received', 'appointment_created', 'captured', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."vet_policy" AS ENUM('clinic_assigns', 'visitor_chooses');--> statement-breakpoint
CREATE TYPE "public"."visit_service_status" AS ENUM('pending', 'waiting', 'in_consultation', 'in_progress', 'requested', 'resulted', 'applied', 'done', 'delivered', 'voided');--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone,
	CONSTRAINT "organizations_slug_unique" UNIQUE("slug"),
	CONSTRAINT "organizations_slug_check" CHECK ("organizations"."slug" ~ '^[a-z0-9-]+$')
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization" uuid NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"role" "role" NOT NULL,
	"email_confirmed" boolean DEFAULT false NOT NULL,
	"email_confirmed_at" timestamp with time zone,
	"last_sign_in_at" timestamp with time zone,
	"banned_until" timestamp with time zone,
	"disabled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_organization_email_unique" UNIQUE("organization","email"),
	CONSTRAINT "users_email_check" CHECK ("users"."email" = lower("users"."email"))
);
--> statement-breakpoint
CREATE TABLE "superadmins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization" uuid NOT NULL,
	"user" uuid NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"avatar" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone,
	CONSTRAINT "superadmins_user_unique" UNIQUE("user")
);
--> statement-breakpoint
CREATE TABLE "owners" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization" uuid NOT NULL,
	"user" uuid NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"description" text,
	"phone" text,
	"avatar" text,
	"position" text,
	"occupation" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone,
	CONSTRAINT "owners_user_unique" UNIQUE("user")
);
--> statement-breakpoint
CREATE TABLE "employees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization" uuid NOT NULL,
	"user" uuid NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"phone" text,
	"avatar" text,
	"position" "employee_position" NOT NULL,
	"color" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone,
	CONSTRAINT "employees_user_unique" UNIQUE("user"),
	CONSTRAINT "employees_color_check" CHECK ("employees"."color" ~ '^#[0-9a-fA-F]{6}$')
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user" uuid NOT NULL,
	"ip" text NOT NULL,
	"user_agent" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "oauth_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"user" uuid NOT NULL,
	"ip" text NOT NULL,
	"user_agent" text NOT NULL,
	"redirect_uri" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "oauth_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "account_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user" uuid NOT NULL,
	"type" "account_token_type" NOT NULL,
	"token" text NOT NULL,
	"data" jsonb,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user" uuid NOT NULL,
	"name" text NOT NULL,
	"permissions" text[] DEFAULT '{}'::text[] NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "permissions_user_unique" UNIQUE("user")
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization" uuid NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text,
	"debt" numeric(12, 2) DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone,
	CONSTRAINT "clients_debt_check" CHECK ("clients"."debt" >= 0)
);
--> statement-breakpoint
CREATE TABLE "patients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization" uuid NOT NULL,
	"client" uuid NOT NULL,
	"name" text NOT NULL,
	"species" "species" NOT NULL,
	"breed" text,
	"sex" "patient_sex",
	"birth_date" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "patients_medical_record" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization" uuid NOT NULL,
	"patient" uuid NOT NULL,
	"allergies" text[] DEFAULT '{}' NOT NULL,
	"aggressive" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone,
	CONSTRAINT "patients_medical_record_patient_unique" UNIQUE("patient")
);
--> statement-breakpoint
CREATE TABLE "patients_vaccination" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization" uuid NOT NULL,
	"patient" uuid NOT NULL,
	"vaccine" text NOT NULL,
	"applied_at" timestamp with time zone NOT NULL,
	"next_due_at" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone,
	CONSTRAINT "patients_vaccination_next_due_at_check" CHECK ("patients_vaccination"."next_due_at" >= "patients_vaccination"."applied_at"::date)
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization" uuid NOT NULL,
	"type" "service_type" NOT NULL,
	"name" text NOT NULL,
	"price" numeric(12, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone,
	CONSTRAINT "services_organization_type_name_unique" UNIQUE("organization","type","name"),
	CONSTRAINT "services_price_check" CHECK ("services"."price" >= 0)
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization" uuid NOT NULL,
	"name" text NOT NULL,
	"category" "product_category" NOT NULL,
	"stock" integer DEFAULT 0 NOT NULL,
	"min_stock" integer DEFAULT 0 NOT NULL,
	"price" numeric(12, 2) NOT NULL,
	"expiry" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone,
	CONSTRAINT "products_stock_check" CHECK ("products"."stock" >= 0 and "products"."min_stock" >= 0),
	CONSTRAINT "products_price_check" CHECK ("products"."price" >= 0)
);
--> statement-breakpoint
CREATE TABLE "appointments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization" uuid NOT NULL,
	"patient" uuid NOT NULL,
	"vet" uuid,
	"starts_at" timestamp with time zone NOT NULL,
	"duration_minutes" integer NOT NULL,
	"reason" text NOT NULL,
	"status" "appointment_status" DEFAULT 'pending' NOT NULL,
	"source" "appointment_source" DEFAULT 'staff' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone,
	CONSTRAINT "appointments_duration_minutes_check" CHECK ("appointments"."duration_minutes" > 0)
);
--> statement-breakpoint
CREATE TABLE "appointments_availability" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization" uuid NOT NULL,
	"timezone" text NOT NULL,
	"week" jsonb NOT NULL,
	"overrides" jsonb NOT NULL,
	"slot_minutes" integer NOT NULL,
	"buffer_before" integer NOT NULL,
	"buffer_after" integer NOT NULL,
	"min_notice_hours" integer NOT NULL,
	"max_advance_days" integer NOT NULL,
	"max_per_day" integer NOT NULL,
	"online_booking" boolean NOT NULL,
	"auto_confirm" boolean NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone,
	CONSTRAINT "appointments_availability_organization_unique" UNIQUE("organization"),
	CONSTRAINT "appointments_availability_positive_check" CHECK ("appointments_availability"."slot_minutes" > 0 and "appointments_availability"."max_advance_days" > 0),
	CONSTRAINT "appointments_availability_non_negative_check" CHECK ("appointments_availability"."buffer_before" >= 0 and "appointments_availability"."buffer_after" >= 0 and "appointments_availability"."min_notice_hours" >= 0 and "appointments_availability"."max_per_day" >= 0)
);
--> statement-breakpoint
CREATE TABLE "visits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization" uuid NOT NULL,
	"client" uuid NOT NULL,
	"invoice" uuid,
	"started" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "visits_service" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization" uuid NOT NULL,
	"visit" uuid NOT NULL,
	"patient" uuid NOT NULL,
	"service" uuid,
	"type" "service_type" NOT NULL,
	"label" text NOT NULL,
	"price" numeric(12, 2) NOT NULL,
	"status" "visit_service_status" NOT NULL,
	"started" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone,
	CONSTRAINT "visits_service_price_check" CHECK ("visits_service"."price" >= 0)
);
--> statement-breakpoint
CREATE TABLE "visits_service_grooming" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization" uuid NOT NULL,
	"visit_service" uuid NOT NULL,
	"groomer" uuid,
	"belongings" text DEFAULT '' NOT NULL,
	"started_at" timestamp with time zone,
	"finished_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone,
	CONSTRAINT "visits_service_grooming_visit_service_unique" UNIQUE("visit_service"),
	CONSTRAINT "visits_service_grooming_finished_at_check" CHECK ("visits_service_grooming"."finished_at" >= "visits_service_grooming"."started_at")
);
--> statement-breakpoint
CREATE TABLE "visits_service_lab" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization" uuid NOT NULL,
	"visit_service" uuid NOT NULL,
	"result" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "visits_service_lab_visit_service_unique" UNIQUE("visit_service")
);
--> statement-breakpoint
CREATE TABLE "visits_service_product" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization" uuid NOT NULL,
	"visit_service" uuid NOT NULL,
	"product" uuid,
	"consultation" uuid,
	"quantity" integer NOT NULL,
	"unit_price" numeric(12, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "visits_service_product_visit_service_unique" UNIQUE("visit_service"),
	CONSTRAINT "visits_service_product_quantity_check" CHECK ("visits_service_product"."quantity" > 0),
	CONSTRAINT "visits_service_product_unit_price_check" CHECK ("visits_service_product"."unit_price" >= 0)
);
--> statement-breakpoint
CREATE TABLE "consultations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization" uuid NOT NULL,
	"patient" uuid NOT NULL,
	"vet" uuid,
	"weight_kg" numeric(6, 2),
	"temperature_c" numeric(4, 1),
	"heart_rate_bpm" integer,
	"anamnesis" text NOT NULL,
	"diagnosis" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "consultations_vitals_check" CHECK ("consultations"."weight_kg" > 0 and "consultations"."temperature_c" > 0 and "consultations"."heart_rate_bpm" > 0)
);
--> statement-breakpoint
CREATE TABLE "consultations_prescription" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization" uuid NOT NULL,
	"consultation" uuid NOT NULL,
	"medication" text NOT NULL,
	"dosage" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization" uuid NOT NULL,
	"client" uuid NOT NULL,
	"number" integer NOT NULL,
	"subtotal" numeric(12, 2) NOT NULL,
	"discount" numeric(12, 2) DEFAULT 0 NOT NULL,
	"discount_percent" numeric(5, 2) DEFAULT 0 NOT NULL,
	"tax" numeric(12, 2) NOT NULL,
	"previous_debt" numeric(12, 2) DEFAULT 0 NOT NULL,
	"total" numeric(12, 2) NOT NULL,
	"method" "pay_method" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "invoices_organization_number_unique" UNIQUE("organization","number"),
	CONSTRAINT "invoices_amounts_check" CHECK ("invoices"."subtotal" >= 0 and "invoices"."tax" >= 0 and "invoices"."previous_debt" >= 0 and "invoices"."total" >= 0),
	CONSTRAINT "invoices_discount_check" CHECK ("invoices"."discount" >= 0 and "invoices"."discount" <= "invoices"."subtotal"),
	CONSTRAINT "invoices_discount_percent_check" CHECK ("invoices"."discount_percent" between 0 and 100)
);
--> statement-breakpoint
CREATE TABLE "invoices_item" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization" uuid NOT NULL,
	"invoice" uuid NOT NULL,
	"description" text NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"area" "business_area" NOT NULL,
	"patient" uuid NOT NULL,
	"visit_service" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "invoices_item_amount_check" CHECK ("invoices_item"."amount" >= 0)
);
--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization" uuid NOT NULL,
	"category" text NOT NULL,
	"description" text NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone,
	CONSTRAINT "expenses_amount_check" CHECK ("expenses"."amount" > 0)
);
--> statement-breakpoint
CREATE TABLE "portals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization" uuid NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"purpose" "portal_purpose" NOT NULL,
	"campaign_name" text,
	"status" "portal_status" DEFAULT 'draft' NOT NULL,
	"palette_primary" text NOT NULL,
	"palette_accent" text NOT NULL,
	"palette_background" text NOT NULL,
	"markdown" text NOT NULL,
	"logo_url" text NOT NULL,
	"vet_policy" "vet_policy" NOT NULL,
	"default_vet" uuid,
	"default_reason" text,
	"auto_confirm" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone,
	CONSTRAINT "portals_organization_slug_unique" UNIQUE("organization","slug"),
	CONSTRAINT "portals_slug_check" CHECK ("portals"."slug" ~ '^[a-z0-9-]+$'),
	CONSTRAINT "portals_palette_check" CHECK ("portals"."palette_primary" ~ '^#[0-9a-fA-F]{6}$' and "portals"."palette_accent" ~ '^#[0-9a-fA-F]{6}$' and "portals"."palette_background" ~ '^#[0-9a-fA-F]{6}$')
);
--> statement-breakpoint
CREATE TABLE "portals_stage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization" uuid NOT NULL,
	"portal" uuid NOT NULL,
	"name" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"position" integer NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone,
	CONSTRAINT "portals_stage_portal_name_unique" UNIQUE("portal","name"),
	CONSTRAINT "portals_stage_position_check" CHECK ("portals_stage"."position" >= 0)
);
--> statement-breakpoint
CREATE TABLE "portals_field" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization" uuid NOT NULL,
	"portal" uuid NOT NULL,
	"stage" uuid NOT NULL,
	"name" text NOT NULL,
	"label" text NOT NULL,
	"help_text" text,
	"placeholder" text,
	"type" "field_type" NOT NULL,
	"binding" "field_binding",
	"required" boolean DEFAULT false NOT NULL,
	"position" integer NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"min_length" integer,
	"max_length" integer,
	"min_value" numeric,
	"max_value" numeric,
	"min_date" date,
	"max_date" date,
	"options_source" "options_source",
	"min_selected" integer,
	"max_selected" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone,
	CONSTRAINT "portals_field_portal_name_unique" UNIQUE("portal","name"),
	CONSTRAINT "portals_field_position_check" CHECK ("portals_field"."position" >= 0),
	CONSTRAINT "portals_field_length_check" CHECK ("portals_field"."min_length" <= "portals_field"."max_length"),
	CONSTRAINT "portals_field_value_check" CHECK ("portals_field"."min_value" <= "portals_field"."max_value"),
	CONSTRAINT "portals_field_date_check" CHECK ("portals_field"."min_date" <= "portals_field"."max_date"),
	CONSTRAINT "portals_field_selected_check" CHECK ("portals_field"."min_selected" <= "portals_field"."max_selected")
);
--> statement-breakpoint
CREATE TABLE "portals_field_option" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization" uuid NOT NULL,
	"field" uuid NOT NULL,
	"value" text NOT NULL,
	"label" text NOT NULL,
	"position" integer NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone,
	CONSTRAINT "portals_field_option_position_check" CHECK ("portals_field_option"."position" >= 0)
);
--> statement-breakpoint
CREATE TABLE "portals_submission" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization" uuid NOT NULL,
	"portal" uuid NOT NULL,
	"idempotency_key" text NOT NULL,
	"status" "submission_status" DEFAULT 'received' NOT NULL,
	"rejection_reason" "rejection_reason",
	"needs_review" boolean DEFAULT false NOT NULL,
	"client" uuid,
	"patient" uuid,
	"appointment" uuid,
	"campaign_name" text,
	"reviewed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone,
	CONSTRAINT "portals_submission_portal_idempotencyKey_unique" UNIQUE("portal","idempotency_key")
);
--> statement-breakpoint
CREATE TABLE "portals_answer" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization" uuid NOT NULL,
	"submission" uuid NOT NULL,
	"field" uuid,
	"field_name" text NOT NULL,
	"field_label" text NOT NULL,
	"field_type" "field_type" NOT NULL,
	"binding" "field_binding",
	"stage_title" text NOT NULL,
	"position" integer NOT NULL,
	"value_text" text,
	"option" uuid,
	"option_label" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "portals_answer_position_check" CHECK ("portals_answer"."position" >= 0)
);
--> statement-breakpoint
CREATE TABLE "migrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"delta" integer NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "migrations_delta_unique" UNIQUE("delta")
);
--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_organization_organizations_id_fk" FOREIGN KEY ("organization") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "superadmins" ADD CONSTRAINT "superadmins_organization_organizations_id_fk" FOREIGN KEY ("organization") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "superadmins" ADD CONSTRAINT "superadmins_user_users_id_fk" FOREIGN KEY ("user") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "owners" ADD CONSTRAINT "owners_organization_organizations_id_fk" FOREIGN KEY ("organization") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "owners" ADD CONSTRAINT "owners_user_users_id_fk" FOREIGN KEY ("user") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_organization_organizations_id_fk" FOREIGN KEY ("organization") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_user_users_id_fk" FOREIGN KEY ("user") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_users_id_fk" FOREIGN KEY ("user") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "oauth_codes" ADD CONSTRAINT "oauth_codes_user_users_id_fk" FOREIGN KEY ("user") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "account_tokens" ADD CONSTRAINT "account_tokens_user_users_id_fk" FOREIGN KEY ("user") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_user_users_id_fk" FOREIGN KEY ("user") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_organization_organizations_id_fk" FOREIGN KEY ("organization") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "patients" ADD CONSTRAINT "patients_organization_organizations_id_fk" FOREIGN KEY ("organization") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "patients" ADD CONSTRAINT "patients_client_clients_id_fk" FOREIGN KEY ("client") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "patients_medical_record" ADD CONSTRAINT "patients_medical_record_organization_organizations_id_fk" FOREIGN KEY ("organization") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "patients_medical_record" ADD CONSTRAINT "patients_medical_record_patient_patients_id_fk" FOREIGN KEY ("patient") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "patients_vaccination" ADD CONSTRAINT "patients_vaccination_organization_organizations_id_fk" FOREIGN KEY ("organization") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "patients_vaccination" ADD CONSTRAINT "patients_vaccination_patient_patients_id_fk" FOREIGN KEY ("patient") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_organization_organizations_id_fk" FOREIGN KEY ("organization") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_organization_organizations_id_fk" FOREIGN KEY ("organization") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_organization_organizations_id_fk" FOREIGN KEY ("organization") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patient_patients_id_fk" FOREIGN KEY ("patient") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_vet_employees_id_fk" FOREIGN KEY ("vet") REFERENCES "public"."employees"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "appointments_availability" ADD CONSTRAINT "appointments_availability_organization_organizations_id_fk" FOREIGN KEY ("organization") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "visits" ADD CONSTRAINT "visits_organization_organizations_id_fk" FOREIGN KEY ("organization") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "visits" ADD CONSTRAINT "visits_client_clients_id_fk" FOREIGN KEY ("client") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "visits" ADD CONSTRAINT "visits_invoice_invoices_id_fk" FOREIGN KEY ("invoice") REFERENCES "public"."invoices"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "visits_service" ADD CONSTRAINT "visits_service_organization_organizations_id_fk" FOREIGN KEY ("organization") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "visits_service" ADD CONSTRAINT "visits_service_visit_visits_id_fk" FOREIGN KEY ("visit") REFERENCES "public"."visits"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "visits_service" ADD CONSTRAINT "visits_service_patient_patients_id_fk" FOREIGN KEY ("patient") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "visits_service" ADD CONSTRAINT "visits_service_service_services_id_fk" FOREIGN KEY ("service") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "visits_service_grooming" ADD CONSTRAINT "visits_service_grooming_organization_organizations_id_fk" FOREIGN KEY ("organization") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "visits_service_grooming" ADD CONSTRAINT "visits_service_grooming_visit_service_visits_service_id_fk" FOREIGN KEY ("visit_service") REFERENCES "public"."visits_service"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "visits_service_grooming" ADD CONSTRAINT "visits_service_grooming_groomer_employees_id_fk" FOREIGN KEY ("groomer") REFERENCES "public"."employees"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "visits_service_lab" ADD CONSTRAINT "visits_service_lab_organization_organizations_id_fk" FOREIGN KEY ("organization") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "visits_service_lab" ADD CONSTRAINT "visits_service_lab_visit_service_visits_service_id_fk" FOREIGN KEY ("visit_service") REFERENCES "public"."visits_service"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "visits_service_product" ADD CONSTRAINT "visits_service_product_organization_organizations_id_fk" FOREIGN KEY ("organization") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "visits_service_product" ADD CONSTRAINT "visits_service_product_visit_service_visits_service_id_fk" FOREIGN KEY ("visit_service") REFERENCES "public"."visits_service"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "visits_service_product" ADD CONSTRAINT "visits_service_product_product_products_id_fk" FOREIGN KEY ("product") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "visits_service_product" ADD CONSTRAINT "visits_service_product_consultation_consultations_id_fk" FOREIGN KEY ("consultation") REFERENCES "public"."consultations"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_organization_organizations_id_fk" FOREIGN KEY ("organization") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_patient_patients_id_fk" FOREIGN KEY ("patient") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_vet_employees_id_fk" FOREIGN KEY ("vet") REFERENCES "public"."employees"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "consultations_prescription" ADD CONSTRAINT "consultations_prescription_organization_organizations_id_fk" FOREIGN KEY ("organization") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "consultations_prescription" ADD CONSTRAINT "consultations_prescription_consultation_consultations_id_fk" FOREIGN KEY ("consultation") REFERENCES "public"."consultations"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_organization_organizations_id_fk" FOREIGN KEY ("organization") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_client_clients_id_fk" FOREIGN KEY ("client") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "invoices_item" ADD CONSTRAINT "invoices_item_organization_organizations_id_fk" FOREIGN KEY ("organization") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "invoices_item" ADD CONSTRAINT "invoices_item_invoice_invoices_id_fk" FOREIGN KEY ("invoice") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "invoices_item" ADD CONSTRAINT "invoices_item_patient_patients_id_fk" FOREIGN KEY ("patient") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "invoices_item" ADD CONSTRAINT "invoices_item_visit_service_visits_service_id_fk" FOREIGN KEY ("visit_service") REFERENCES "public"."visits_service"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_organization_organizations_id_fk" FOREIGN KEY ("organization") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "portals" ADD CONSTRAINT "portals_organization_organizations_id_fk" FOREIGN KEY ("organization") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "portals" ADD CONSTRAINT "portals_default_vet_employees_id_fk" FOREIGN KEY ("default_vet") REFERENCES "public"."employees"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "portals_stage" ADD CONSTRAINT "portals_stage_organization_organizations_id_fk" FOREIGN KEY ("organization") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "portals_stage" ADD CONSTRAINT "portals_stage_portal_portals_id_fk" FOREIGN KEY ("portal") REFERENCES "public"."portals"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "portals_field" ADD CONSTRAINT "portals_field_organization_organizations_id_fk" FOREIGN KEY ("organization") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "portals_field" ADD CONSTRAINT "portals_field_portal_portals_id_fk" FOREIGN KEY ("portal") REFERENCES "public"."portals"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "portals_field" ADD CONSTRAINT "portals_field_stage_portals_stage_id_fk" FOREIGN KEY ("stage") REFERENCES "public"."portals_stage"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "portals_field_option" ADD CONSTRAINT "portals_field_option_organization_organizations_id_fk" FOREIGN KEY ("organization") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "portals_field_option" ADD CONSTRAINT "portals_field_option_field_portals_field_id_fk" FOREIGN KEY ("field") REFERENCES "public"."portals_field"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "portals_submission" ADD CONSTRAINT "portals_submission_organization_organizations_id_fk" FOREIGN KEY ("organization") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "portals_submission" ADD CONSTRAINT "portals_submission_portal_portals_id_fk" FOREIGN KEY ("portal") REFERENCES "public"."portals"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "portals_submission" ADD CONSTRAINT "portals_submission_client_clients_id_fk" FOREIGN KEY ("client") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "portals_submission" ADD CONSTRAINT "portals_submission_patient_patients_id_fk" FOREIGN KEY ("patient") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "portals_submission" ADD CONSTRAINT "portals_submission_appointment_appointments_id_fk" FOREIGN KEY ("appointment") REFERENCES "public"."appointments"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "portals_answer" ADD CONSTRAINT "portals_answer_organization_organizations_id_fk" FOREIGN KEY ("organization") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "portals_answer" ADD CONSTRAINT "portals_answer_submission_portals_submission_id_fk" FOREIGN KEY ("submission") REFERENCES "public"."portals_submission"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "portals_answer" ADD CONSTRAINT "portals_answer_field_portals_field_id_fk" FOREIGN KEY ("field") REFERENCES "public"."portals_field"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "portals_answer" ADD CONSTRAINT "portals_answer_option_portals_field_option_id_fk" FOREIGN KEY ("option") REFERENCES "public"."portals_field_option"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "superadmins_organization_index" ON "superadmins" USING btree ("organization");--> statement-breakpoint
CREATE INDEX "owners_organization_index" ON "owners" USING btree ("organization");--> statement-breakpoint
CREATE INDEX "employees_organization_index" ON "employees" USING btree ("organization");--> statement-breakpoint
CREATE INDEX "sessions_user_index" ON "sessions" USING btree ("user");--> statement-breakpoint
CREATE INDEX "oauth_codes_user_index" ON "oauth_codes" USING btree ("user");--> statement-breakpoint
CREATE UNIQUE INDEX "account_tokens_user_type_index" ON "account_tokens" USING btree ("user","type");--> statement-breakpoint
CREATE INDEX "clients_organization_index" ON "clients" USING btree ("organization");--> statement-breakpoint
CREATE INDEX "patients_organization_index" ON "patients" USING btree ("organization");--> statement-breakpoint
CREATE INDEX "patients_medical_record_organization_index" ON "patients_medical_record" USING btree ("organization");--> statement-breakpoint
CREATE INDEX "patients_vaccination_organization_index" ON "patients_vaccination" USING btree ("organization");--> statement-breakpoint
CREATE INDEX "products_organization_index" ON "products" USING btree ("organization");--> statement-breakpoint
CREATE INDEX "appointments_organization_index" ON "appointments" USING btree ("organization");--> statement-breakpoint
CREATE UNIQUE INDEX "appointments_vet_starts_at_unique" ON "appointments" USING btree ("vet","starts_at") WHERE "appointments"."status" <> 'cancelled' and "appointments"."archived_at" is null;--> statement-breakpoint
CREATE INDEX "visits_organization_index" ON "visits" USING btree ("organization");--> statement-breakpoint
CREATE UNIQUE INDEX "visits_open_client_unique" ON "visits" USING btree ("client") WHERE "visits"."invoice" is null and "visits"."archived_at" is null;--> statement-breakpoint
CREATE INDEX "visits_service_organization_index" ON "visits_service" USING btree ("organization");--> statement-breakpoint
CREATE INDEX "visits_service_grooming_organization_index" ON "visits_service_grooming" USING btree ("organization");--> statement-breakpoint
CREATE INDEX "visits_service_lab_organization_index" ON "visits_service_lab" USING btree ("organization");--> statement-breakpoint
CREATE INDEX "visits_service_product_organization_index" ON "visits_service_product" USING btree ("organization");--> statement-breakpoint
CREATE INDEX "consultations_organization_index" ON "consultations" USING btree ("organization");--> statement-breakpoint
CREATE INDEX "consultations_prescription_organization_index" ON "consultations_prescription" USING btree ("organization");--> statement-breakpoint
CREATE INDEX "invoices_item_organization_index" ON "invoices_item" USING btree ("organization");--> statement-breakpoint
CREATE INDEX "expenses_organization_index" ON "expenses" USING btree ("organization");--> statement-breakpoint
CREATE INDEX "portals_stage_organization_index" ON "portals_stage" USING btree ("organization");--> statement-breakpoint
CREATE INDEX "portals_field_organization_index" ON "portals_field" USING btree ("organization");--> statement-breakpoint
CREATE INDEX "portals_field_option_organization_index" ON "portals_field_option" USING btree ("organization");--> statement-breakpoint
CREATE INDEX "portals_submission_organization_index" ON "portals_submission" USING btree ("organization");--> statement-breakpoint
CREATE INDEX "portals_answer_organization_index" ON "portals_answer" USING btree ("organization");