CREATE TYPE "public"."whatsapp_account_status" AS ENUM('active', 'reauth_required');--> statement-breakpoint
CREATE TYPE "public"."whatsapp_message_direction" AS ENUM('outbound', 'inbound');--> statement-breakpoint
CREATE TYPE "public"."whatsapp_message_status" AS ENUM('queued', 'sent', 'delivered', 'read', 'failed');--> statement-breakpoint
CREATE TYPE "public"."whatsapp_template_category" AS ENUM('utility', 'marketing', 'authentication');--> statement-breakpoint
CREATE TYPE "public"."whatsapp_template_status" AS ENUM('pending', 'approved', 'rejected', 'paused', 'disabled');--> statement-breakpoint
CREATE TABLE "whatsapp_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization" uuid NOT NULL,
	"waba_id" text NOT NULL,
	"phone_number_id" text NOT NULL,
	"display_phone_number" text NOT NULL,
	"verified_name" text NOT NULL,
	"access_token" text NOT NULL,
	"status" "whatsapp_account_status" DEFAULT 'active' NOT NULL,
	"consent_accepted_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "whatsapp_accounts_organization_unique" UNIQUE("organization"),
	CONSTRAINT "whatsapp_accounts_phoneNumberId_unique" UNIQUE("phone_number_id")
);
--> statement-breakpoint
CREATE TABLE "whatsapp_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization" uuid NOT NULL,
	"name" text NOT NULL,
	"language" text NOT NULL,
	"meta_id" text NOT NULL,
	"category" "whatsapp_template_category" NOT NULL,
	"status" "whatsapp_template_status" DEFAULT 'pending' NOT NULL,
	"rejected_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "whatsapp_templates_organization_name_language_unique" UNIQUE("organization","name","language")
);
--> statement-breakpoint
CREATE TABLE "whatsapp_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization" uuid NOT NULL,
	"client" uuid,
	"direction" "whatsapp_message_direction" NOT NULL,
	"status" "whatsapp_message_status" NOT NULL,
	"wamid" text,
	"phone" text NOT NULL,
	"template" text,
	"billable" boolean,
	"error_code" integer,
	"error_message" text,
	"sent_at" timestamp with time zone,
	"delivered_at" timestamp with time zone,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "whatsapp_messages_wamid_unique" UNIQUE("wamid")
);
--> statement-breakpoint
ALTER TABLE "whatsapp_accounts" ADD CONSTRAINT "whatsapp_accounts_organization_organizations_id_fk" FOREIGN KEY ("organization") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "whatsapp_templates" ADD CONSTRAINT "whatsapp_templates_organization_organizations_id_fk" FOREIGN KEY ("organization") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "whatsapp_messages" ADD CONSTRAINT "whatsapp_messages_organization_organizations_id_fk" FOREIGN KEY ("organization") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "whatsapp_messages" ADD CONSTRAINT "whatsapp_messages_client_clients_id_fk" FOREIGN KEY ("client") REFERENCES "public"."clients"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "whatsapp_accounts_waba_id_index" ON "whatsapp_accounts" USING btree ("waba_id");--> statement-breakpoint
CREATE INDEX "whatsapp_messages_organization_created_at_index" ON "whatsapp_messages" USING btree ("organization","created_at");