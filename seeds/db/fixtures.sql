--
-- PostgreSQL database dump
--

\restrict PR8fp6MSQ5fWK6HgHOaG0oLEpVcNK1fC2EOQ6hfjsV1tANodAqO91PTtH7ENlqU

-- Dumped from database version 17.0 (DBngin.app)
-- Dumped by pg_dump version 18.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.visits_service DROP CONSTRAINT IF EXISTS visits_service_visit_visits_id_fk;
ALTER TABLE IF EXISTS ONLY public.visits_service DROP CONSTRAINT IF EXISTS visits_service_service_services_id_fk;
ALTER TABLE IF EXISTS ONLY public.visits_service_product DROP CONSTRAINT IF EXISTS visits_service_product_visit_service_visits_service_id_fk;
ALTER TABLE IF EXISTS ONLY public.visits_service_product DROP CONSTRAINT IF EXISTS visits_service_product_product_products_id_fk;
ALTER TABLE IF EXISTS ONLY public.visits_service_product DROP CONSTRAINT IF EXISTS visits_service_product_organization_organizations_id_fk;
ALTER TABLE IF EXISTS ONLY public.visits_service_product DROP CONSTRAINT IF EXISTS visits_service_product_consultation_consultations_id_fk;
ALTER TABLE IF EXISTS ONLY public.visits_service DROP CONSTRAINT IF EXISTS visits_service_patient_patients_id_fk;
ALTER TABLE IF EXISTS ONLY public.visits_service DROP CONSTRAINT IF EXISTS visits_service_organization_organizations_id_fk;
ALTER TABLE IF EXISTS ONLY public.visits_service_lab DROP CONSTRAINT IF EXISTS visits_service_lab_visit_service_visits_service_id_fk;
ALTER TABLE IF EXISTS ONLY public.visits_service_lab DROP CONSTRAINT IF EXISTS visits_service_lab_organization_organizations_id_fk;
ALTER TABLE IF EXISTS ONLY public.visits_service_grooming DROP CONSTRAINT IF EXISTS visits_service_grooming_visit_service_visits_service_id_fk;
ALTER TABLE IF EXISTS ONLY public.visits_service_grooming DROP CONSTRAINT IF EXISTS visits_service_grooming_organization_organizations_id_fk;
ALTER TABLE IF EXISTS ONLY public.visits_service_grooming DROP CONSTRAINT IF EXISTS visits_service_grooming_groomer_employees_id_fk;
ALTER TABLE IF EXISTS ONLY public.visits DROP CONSTRAINT IF EXISTS visits_organization_organizations_id_fk;
ALTER TABLE IF EXISTS ONLY public.visits DROP CONSTRAINT IF EXISTS visits_invoice_invoices_id_fk;
ALTER TABLE IF EXISTS ONLY public.visits DROP CONSTRAINT IF EXISTS visits_client_clients_id_fk;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_organization_organizations_id_fk;
ALTER TABLE IF EXISTS ONLY public.superadmins DROP CONSTRAINT IF EXISTS superadmins_user_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.superadmins DROP CONSTRAINT IF EXISTS superadmins_organization_organizations_id_fk;
ALTER TABLE IF EXISTS ONLY public.sessions DROP CONSTRAINT IF EXISTS sessions_user_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.services DROP CONSTRAINT IF EXISTS services_organization_organizations_id_fk;
ALTER TABLE IF EXISTS ONLY public.products DROP CONSTRAINT IF EXISTS products_organization_organizations_id_fk;
ALTER TABLE IF EXISTS ONLY public.portals_submission DROP CONSTRAINT IF EXISTS portals_submission_portal_portals_id_fk;
ALTER TABLE IF EXISTS ONLY public.portals_submission DROP CONSTRAINT IF EXISTS portals_submission_patient_patients_id_fk;
ALTER TABLE IF EXISTS ONLY public.portals_submission DROP CONSTRAINT IF EXISTS portals_submission_organization_organizations_id_fk;
ALTER TABLE IF EXISTS ONLY public.portals_submission DROP CONSTRAINT IF EXISTS portals_submission_client_clients_id_fk;
ALTER TABLE IF EXISTS ONLY public.portals_submission DROP CONSTRAINT IF EXISTS portals_submission_appointment_appointments_id_fk;
ALTER TABLE IF EXISTS ONLY public.portals_stage DROP CONSTRAINT IF EXISTS portals_stage_portal_portals_id_fk;
ALTER TABLE IF EXISTS ONLY public.portals_stage DROP CONSTRAINT IF EXISTS portals_stage_organization_organizations_id_fk;
ALTER TABLE IF EXISTS ONLY public.portals DROP CONSTRAINT IF EXISTS portals_organization_organizations_id_fk;
ALTER TABLE IF EXISTS ONLY public.portals_field DROP CONSTRAINT IF EXISTS portals_field_stage_portals_stage_id_fk;
ALTER TABLE IF EXISTS ONLY public.portals_field DROP CONSTRAINT IF EXISTS portals_field_portal_portals_id_fk;
ALTER TABLE IF EXISTS ONLY public.portals_field DROP CONSTRAINT IF EXISTS portals_field_organization_organizations_id_fk;
ALTER TABLE IF EXISTS ONLY public.portals_field_option DROP CONSTRAINT IF EXISTS portals_field_option_organization_organizations_id_fk;
ALTER TABLE IF EXISTS ONLY public.portals_field_option DROP CONSTRAINT IF EXISTS portals_field_option_field_portals_field_id_fk;
ALTER TABLE IF EXISTS ONLY public.portals DROP CONSTRAINT IF EXISTS portals_default_vet_employees_id_fk;
ALTER TABLE IF EXISTS ONLY public.portals_answer DROP CONSTRAINT IF EXISTS portals_answer_submission_portals_submission_id_fk;
ALTER TABLE IF EXISTS ONLY public.portals_answer DROP CONSTRAINT IF EXISTS portals_answer_organization_organizations_id_fk;
ALTER TABLE IF EXISTS ONLY public.portals_answer DROP CONSTRAINT IF EXISTS portals_answer_option_portals_field_option_id_fk;
ALTER TABLE IF EXISTS ONLY public.portals_answer DROP CONSTRAINT IF EXISTS portals_answer_field_portals_field_id_fk;
ALTER TABLE IF EXISTS ONLY public.permissions DROP CONSTRAINT IF EXISTS permissions_user_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.patients_vaccination DROP CONSTRAINT IF EXISTS patients_vaccination_patient_patients_id_fk;
ALTER TABLE IF EXISTS ONLY public.patients_vaccination DROP CONSTRAINT IF EXISTS patients_vaccination_organization_organizations_id_fk;
ALTER TABLE IF EXISTS ONLY public.patients DROP CONSTRAINT IF EXISTS patients_organization_organizations_id_fk;
ALTER TABLE IF EXISTS ONLY public.patients_medical_record DROP CONSTRAINT IF EXISTS patients_medical_record_patient_patients_id_fk;
ALTER TABLE IF EXISTS ONLY public.patients_medical_record DROP CONSTRAINT IF EXISTS patients_medical_record_organization_organizations_id_fk;
ALTER TABLE IF EXISTS ONLY public.patients DROP CONSTRAINT IF EXISTS patients_client_clients_id_fk;
ALTER TABLE IF EXISTS ONLY public.owners DROP CONSTRAINT IF EXISTS owners_user_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.owners DROP CONSTRAINT IF EXISTS owners_organization_organizations_id_fk;
ALTER TABLE IF EXISTS ONLY public.oauth_codes DROP CONSTRAINT IF EXISTS oauth_codes_user_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.invoices DROP CONSTRAINT IF EXISTS invoices_organization_organizations_id_fk;
ALTER TABLE IF EXISTS ONLY public.invoices_item DROP CONSTRAINT IF EXISTS invoices_item_visit_service_visits_service_id_fk;
ALTER TABLE IF EXISTS ONLY public.invoices_item DROP CONSTRAINT IF EXISTS invoices_item_patient_patients_id_fk;
ALTER TABLE IF EXISTS ONLY public.invoices_item DROP CONSTRAINT IF EXISTS invoices_item_organization_organizations_id_fk;
ALTER TABLE IF EXISTS ONLY public.invoices_item DROP CONSTRAINT IF EXISTS invoices_item_invoice_invoices_id_fk;
ALTER TABLE IF EXISTS ONLY public.invoices DROP CONSTRAINT IF EXISTS invoices_client_clients_id_fk;
ALTER TABLE IF EXISTS ONLY public.expenses DROP CONSTRAINT IF EXISTS expenses_organization_organizations_id_fk;
ALTER TABLE IF EXISTS ONLY public.employees DROP CONSTRAINT IF EXISTS employees_user_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.employees DROP CONSTRAINT IF EXISTS employees_organization_organizations_id_fk;
ALTER TABLE IF EXISTS ONLY public.consultations DROP CONSTRAINT IF EXISTS consultations_vet_employees_id_fk;
ALTER TABLE IF EXISTS ONLY public.consultations_prescription DROP CONSTRAINT IF EXISTS consultations_prescription_organization_organizations_id_fk;
ALTER TABLE IF EXISTS ONLY public.consultations_prescription DROP CONSTRAINT IF EXISTS consultations_prescription_consultation_consultations_id_fk;
ALTER TABLE IF EXISTS ONLY public.consultations DROP CONSTRAINT IF EXISTS consultations_patient_patients_id_fk;
ALTER TABLE IF EXISTS ONLY public.consultations DROP CONSTRAINT IF EXISTS consultations_organization_organizations_id_fk;
ALTER TABLE IF EXISTS ONLY public.clients DROP CONSTRAINT IF EXISTS clients_organization_organizations_id_fk;
ALTER TABLE IF EXISTS ONLY public.appointments DROP CONSTRAINT IF EXISTS appointments_vet_employees_id_fk;
ALTER TABLE IF EXISTS ONLY public.appointments DROP CONSTRAINT IF EXISTS appointments_patient_patients_id_fk;
ALTER TABLE IF EXISTS ONLY public.appointments DROP CONSTRAINT IF EXISTS appointments_organization_organizations_id_fk;
ALTER TABLE IF EXISTS ONLY public.appointments_availability DROP CONSTRAINT IF EXISTS appointments_availability_organization_organizations_id_fk;
ALTER TABLE IF EXISTS ONLY public.account_tokens DROP CONSTRAINT IF EXISTS account_tokens_user_users_id_fk;
DROP INDEX IF EXISTS public.visits_service_product_organization_index;
DROP INDEX IF EXISTS public.visits_service_organization_index;
DROP INDEX IF EXISTS public.visits_service_lab_organization_index;
DROP INDEX IF EXISTS public.visits_service_grooming_organization_index;
DROP INDEX IF EXISTS public.visits_organization_index;
DROP INDEX IF EXISTS public.visits_open_client_unique;
DROP INDEX IF EXISTS public.superadmins_organization_index;
DROP INDEX IF EXISTS public.sessions_user_index;
DROP INDEX IF EXISTS public.products_organization_index;
DROP INDEX IF EXISTS public.portals_submission_organization_index;
DROP INDEX IF EXISTS public.portals_stage_organization_index;
DROP INDEX IF EXISTS public.portals_field_organization_index;
DROP INDEX IF EXISTS public.portals_field_option_organization_index;
DROP INDEX IF EXISTS public.portals_answer_organization_index;
DROP INDEX IF EXISTS public.patients_vaccination_organization_index;
DROP INDEX IF EXISTS public.patients_organization_index;
DROP INDEX IF EXISTS public.patients_medical_record_organization_index;
DROP INDEX IF EXISTS public.owners_organization_index;
DROP INDEX IF EXISTS public.oauth_codes_user_index;
DROP INDEX IF EXISTS public.invoices_item_organization_index;
DROP INDEX IF EXISTS public.expenses_organization_index;
DROP INDEX IF EXISTS public.employees_organization_index;
DROP INDEX IF EXISTS public.consultations_prescription_organization_index;
DROP INDEX IF EXISTS public.consultations_organization_index;
DROP INDEX IF EXISTS public.clients_organization_index;
DROP INDEX IF EXISTS public.appointments_vet_starts_at_unique;
DROP INDEX IF EXISTS public.appointments_organization_index;
DROP INDEX IF EXISTS public.account_tokens_user_type_index;
ALTER TABLE IF EXISTS ONLY public.visits_service_product DROP CONSTRAINT IF EXISTS visits_service_product_visit_service_unique;
ALTER TABLE IF EXISTS ONLY public.visits_service_product DROP CONSTRAINT IF EXISTS visits_service_product_pkey;
ALTER TABLE IF EXISTS ONLY public.visits_service DROP CONSTRAINT IF EXISTS visits_service_pkey;
ALTER TABLE IF EXISTS ONLY public.visits_service_lab DROP CONSTRAINT IF EXISTS visits_service_lab_visit_service_unique;
ALTER TABLE IF EXISTS ONLY public.visits_service_lab DROP CONSTRAINT IF EXISTS visits_service_lab_pkey;
ALTER TABLE IF EXISTS ONLY public.visits_service_grooming DROP CONSTRAINT IF EXISTS visits_service_grooming_visit_service_unique;
ALTER TABLE IF EXISTS ONLY public.visits_service_grooming DROP CONSTRAINT IF EXISTS visits_service_grooming_pkey;
ALTER TABLE IF EXISTS ONLY public.visits DROP CONSTRAINT IF EXISTS visits_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_organization_email_unique;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_email_unique;
ALTER TABLE IF EXISTS ONLY public.superadmins DROP CONSTRAINT IF EXISTS superadmins_user_unique;
ALTER TABLE IF EXISTS ONLY public.superadmins DROP CONSTRAINT IF EXISTS superadmins_pkey;
ALTER TABLE IF EXISTS ONLY public.sessions DROP CONSTRAINT IF EXISTS sessions_pkey;
ALTER TABLE IF EXISTS ONLY public.services DROP CONSTRAINT IF EXISTS services_pkey;
ALTER TABLE IF EXISTS ONLY public.services DROP CONSTRAINT IF EXISTS services_organization_type_name_unique;
ALTER TABLE IF EXISTS ONLY public.products DROP CONSTRAINT IF EXISTS products_pkey;
ALTER TABLE IF EXISTS ONLY public.portals_submission DROP CONSTRAINT IF EXISTS "portals_submission_portal_idempotencyKey_unique";
ALTER TABLE IF EXISTS ONLY public.portals_submission DROP CONSTRAINT IF EXISTS portals_submission_pkey;
ALTER TABLE IF EXISTS ONLY public.portals_stage DROP CONSTRAINT IF EXISTS portals_stage_portal_name_unique;
ALTER TABLE IF EXISTS ONLY public.portals_stage DROP CONSTRAINT IF EXISTS portals_stage_pkey;
ALTER TABLE IF EXISTS ONLY public.portals DROP CONSTRAINT IF EXISTS portals_pkey;
ALTER TABLE IF EXISTS ONLY public.portals DROP CONSTRAINT IF EXISTS portals_organization_slug_unique;
ALTER TABLE IF EXISTS ONLY public.portals_field DROP CONSTRAINT IF EXISTS portals_field_portal_name_unique;
ALTER TABLE IF EXISTS ONLY public.portals_field DROP CONSTRAINT IF EXISTS portals_field_pkey;
ALTER TABLE IF EXISTS ONLY public.portals_field_option DROP CONSTRAINT IF EXISTS portals_field_option_pkey;
ALTER TABLE IF EXISTS ONLY public.portals_answer DROP CONSTRAINT IF EXISTS portals_answer_pkey;
ALTER TABLE IF EXISTS ONLY public.permissions DROP CONSTRAINT IF EXISTS permissions_user_unique;
ALTER TABLE IF EXISTS ONLY public.permissions DROP CONSTRAINT IF EXISTS permissions_pkey;
ALTER TABLE IF EXISTS ONLY public.patients_vaccination DROP CONSTRAINT IF EXISTS patients_vaccination_pkey;
ALTER TABLE IF EXISTS ONLY public.patients DROP CONSTRAINT IF EXISTS patients_pkey;
ALTER TABLE IF EXISTS ONLY public.patients_medical_record DROP CONSTRAINT IF EXISTS patients_medical_record_pkey;
ALTER TABLE IF EXISTS ONLY public.patients_medical_record DROP CONSTRAINT IF EXISTS patients_medical_record_patient_unique;
ALTER TABLE IF EXISTS ONLY public.owners DROP CONSTRAINT IF EXISTS owners_user_unique;
ALTER TABLE IF EXISTS ONLY public.owners DROP CONSTRAINT IF EXISTS owners_pkey;
ALTER TABLE IF EXISTS ONLY public.organizations DROP CONSTRAINT IF EXISTS organizations_slug_unique;
ALTER TABLE IF EXISTS ONLY public.organizations DROP CONSTRAINT IF EXISTS organizations_pkey;
ALTER TABLE IF EXISTS ONLY public.oauth_codes DROP CONSTRAINT IF EXISTS oauth_codes_pkey;
ALTER TABLE IF EXISTS ONLY public.oauth_codes DROP CONSTRAINT IF EXISTS oauth_codes_code_unique;
ALTER TABLE IF EXISTS ONLY public.migrations DROP CONSTRAINT IF EXISTS migrations_pkey;
ALTER TABLE IF EXISTS ONLY public.migrations DROP CONSTRAINT IF EXISTS migrations_delta_unique;
ALTER TABLE IF EXISTS ONLY public.invoices DROP CONSTRAINT IF EXISTS invoices_pkey;
ALTER TABLE IF EXISTS ONLY public.invoices DROP CONSTRAINT IF EXISTS invoices_organization_number_unique;
ALTER TABLE IF EXISTS ONLY public.invoices_item DROP CONSTRAINT IF EXISTS invoices_item_pkey;
ALTER TABLE IF EXISTS ONLY public.expenses DROP CONSTRAINT IF EXISTS expenses_pkey;
ALTER TABLE IF EXISTS ONLY public.employees DROP CONSTRAINT IF EXISTS employees_user_unique;
ALTER TABLE IF EXISTS ONLY public.employees DROP CONSTRAINT IF EXISTS employees_pkey;
ALTER TABLE IF EXISTS ONLY public.consultations_prescription DROP CONSTRAINT IF EXISTS consultations_prescription_pkey;
ALTER TABLE IF EXISTS ONLY public.consultations DROP CONSTRAINT IF EXISTS consultations_pkey;
ALTER TABLE IF EXISTS ONLY public.clients DROP CONSTRAINT IF EXISTS clients_pkey;
ALTER TABLE IF EXISTS ONLY public.appointments DROP CONSTRAINT IF EXISTS appointments_pkey;
ALTER TABLE IF EXISTS ONLY public.appointments_availability DROP CONSTRAINT IF EXISTS appointments_availability_pkey;
ALTER TABLE IF EXISTS ONLY public.appointments_availability DROP CONSTRAINT IF EXISTS appointments_availability_organization_unique;
ALTER TABLE IF EXISTS ONLY public.account_tokens DROP CONSTRAINT IF EXISTS account_tokens_pkey;
DROP TABLE IF EXISTS public.visits_service_product;
DROP TABLE IF EXISTS public.visits_service_lab;
DROP TABLE IF EXISTS public.visits_service_grooming;
DROP TABLE IF EXISTS public.visits_service;
DROP TABLE IF EXISTS public.visits;
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.superadmins;
DROP TABLE IF EXISTS public.sessions;
DROP TABLE IF EXISTS public.services;
DROP TABLE IF EXISTS public.products;
DROP TABLE IF EXISTS public.portals_submission;
DROP TABLE IF EXISTS public.portals_stage;
DROP TABLE IF EXISTS public.portals_field_option;
DROP TABLE IF EXISTS public.portals_field;
DROP TABLE IF EXISTS public.portals_answer;
DROP TABLE IF EXISTS public.portals;
DROP TABLE IF EXISTS public.permissions;
DROP TABLE IF EXISTS public.patients_vaccination;
DROP TABLE IF EXISTS public.patients_medical_record;
DROP TABLE IF EXISTS public.patients;
DROP TABLE IF EXISTS public.owners;
DROP TABLE IF EXISTS public.organizations;
DROP TABLE IF EXISTS public.oauth_codes;
DROP TABLE IF EXISTS public.migrations;
DROP TABLE IF EXISTS public.invoices_item;
DROP TABLE IF EXISTS public.invoices;
DROP TABLE IF EXISTS public.expenses;
DROP TABLE IF EXISTS public.employees;
DROP TABLE IF EXISTS public.consultations_prescription;
DROP TABLE IF EXISTS public.consultations;
DROP TABLE IF EXISTS public.clients;
DROP TABLE IF EXISTS public.appointments_availability;
DROP TABLE IF EXISTS public.appointments;
DROP TABLE IF EXISTS public.account_tokens;
DROP TYPE IF EXISTS public.visit_service_status;
DROP TYPE IF EXISTS public.vet_policy;
DROP TYPE IF EXISTS public.submission_status;
DROP TYPE IF EXISTS public.species;
DROP TYPE IF EXISTS public.service_type;
DROP TYPE IF EXISTS public.role;
DROP TYPE IF EXISTS public.rejection_reason;
DROP TYPE IF EXISTS public.product_category;
DROP TYPE IF EXISTS public.portal_status;
DROP TYPE IF EXISTS public.portal_purpose;
DROP TYPE IF EXISTS public.pay_method;
DROP TYPE IF EXISTS public.patient_sex;
DROP TYPE IF EXISTS public.options_source;
DROP TYPE IF EXISTS public.field_type;
DROP TYPE IF EXISTS public.field_binding;
DROP TYPE IF EXISTS public.employee_position;
DROP TYPE IF EXISTS public.business_area;
DROP TYPE IF EXISTS public.appointment_status;
DROP TYPE IF EXISTS public.appointment_source;
DROP TYPE IF EXISTS public.account_token_type;
DROP SCHEMA IF EXISTS public;
--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: account_token_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.account_token_type AS ENUM (
    'email_confirmation',
    'password_reset'
);


--
-- Name: appointment_source; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.appointment_source AS ENUM (
    'staff',
    'portal'
);


--
-- Name: appointment_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.appointment_status AS ENUM (
    'pending',
    'confirmed',
    'completed',
    'cancelled'
);


--
-- Name: business_area; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.business_area AS ENUM (
    'clinic',
    'grooming',
    'laboratory'
);


--
-- Name: employee_position; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.employee_position AS ENUM (
    'veterinarian',
    'groomer',
    'receptionist'
);


--
-- Name: field_binding; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.field_binding AS ENUM (
    'client.name',
    'client.phone',
    'client.email',
    'patient.name',
    'patient.species',
    'patient.breed',
    'patient.age',
    'patient.sex',
    'patient.allergies',
    'appointment.date',
    'appointment.time',
    'appointment.vet',
    'appointment.reason'
);


--
-- Name: field_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.field_type AS ENUM (
    'text',
    'textarea',
    'email',
    'phone',
    'number',
    'date',
    'time_slot',
    'select',
    'multiselect',
    'checkbox'
);


--
-- Name: options_source; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.options_source AS ENUM (
    'static',
    'species',
    'vets'
);


--
-- Name: patient_sex; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.patient_sex AS ENUM (
    'male',
    'female'
);


--
-- Name: pay_method; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.pay_method AS ENUM (
    'cash',
    'card',
    'transfer'
);


--
-- Name: portal_purpose; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.portal_purpose AS ENUM (
    'booking',
    'capture'
);


--
-- Name: portal_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.portal_status AS ENUM (
    'draft',
    'published'
);


--
-- Name: product_category; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.product_category AS ENUM (
    'vaccines',
    'medications',
    'grooming',
    'food',
    'supplies'
);


--
-- Name: rejection_reason; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.rejection_reason AS ENUM (
    'slot_taken',
    'outside_availability',
    'max_per_day',
    'portal_changed',
    'portal_closed',
    'duplicate'
);


--
-- Name: role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.role AS ENUM (
    'superadmin',
    'owner',
    'employee',
    'public'
);


--
-- Name: service_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.service_type AS ENUM (
    'veterinary',
    'grooming',
    'laboratory',
    'medication',
    'vaccine'
);


--
-- Name: species; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.species AS ENUM (
    'dog',
    'cat',
    'bird',
    'other'
);


--
-- Name: submission_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.submission_status AS ENUM (
    'received',
    'appointment_created',
    'captured',
    'rejected'
);


--
-- Name: vet_policy; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.vet_policy AS ENUM (
    'clinic_assigns',
    'visitor_chooses'
);


--
-- Name: visit_service_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.visit_service_status AS ENUM (
    'pending',
    'waiting',
    'in_consultation',
    'in_progress',
    'requested',
    'resulted',
    'applied',
    'done',
    'delivered',
    'voided'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: account_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.account_tokens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "user" uuid NOT NULL,
    type public.account_token_type NOT NULL,
    token text NOT NULL,
    data jsonb,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: appointments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.appointments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization uuid NOT NULL,
    patient uuid NOT NULL,
    vet uuid,
    starts_at timestamp with time zone NOT NULL,
    duration_minutes integer NOT NULL,
    reason text NOT NULL,
    status public.appointment_status DEFAULT 'pending'::public.appointment_status NOT NULL,
    source public.appointment_source DEFAULT 'staff'::public.appointment_source NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    archived_at timestamp with time zone,
    CONSTRAINT appointments_duration_minutes_check CHECK ((duration_minutes > 0))
);


--
-- Name: appointments_availability; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.appointments_availability (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization uuid NOT NULL,
    timezone text NOT NULL,
    week jsonb NOT NULL,
    overrides jsonb NOT NULL,
    slot_minutes integer NOT NULL,
    buffer_before integer NOT NULL,
    buffer_after integer NOT NULL,
    min_notice_hours integer NOT NULL,
    max_advance_days integer NOT NULL,
    max_per_day integer NOT NULL,
    online_booking boolean NOT NULL,
    auto_confirm boolean NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    archived_at timestamp with time zone,
    CONSTRAINT appointments_availability_non_negative_check CHECK (((buffer_before >= 0) AND (buffer_after >= 0) AND (min_notice_hours >= 0) AND (max_per_day >= 0))),
    CONSTRAINT appointments_availability_positive_check CHECK (((slot_minutes > 0) AND (max_advance_days > 0)))
);


--
-- Name: clients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.clients (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization uuid NOT NULL,
    name text NOT NULL,
    phone text NOT NULL,
    email text,
    debt numeric(12,2) DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    archived_at timestamp with time zone,
    CONSTRAINT clients_debt_check CHECK ((debt >= (0)::numeric))
);


--
-- Name: consultations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.consultations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization uuid NOT NULL,
    patient uuid NOT NULL,
    vet uuid,
    weight_kg numeric(6,2),
    temperature_c numeric(4,1),
    heart_rate_bpm integer,
    anamnesis text NOT NULL,
    diagnosis text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT consultations_vitals_check CHECK (((weight_kg > (0)::numeric) AND (temperature_c > (0)::numeric) AND (heart_rate_bpm > 0)))
);


--
-- Name: consultations_prescription; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.consultations_prescription (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization uuid NOT NULL,
    consultation uuid NOT NULL,
    medication text NOT NULL,
    dosage text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: employees; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employees (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization uuid NOT NULL,
    "user" uuid NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    phone text,
    avatar text,
    "position" public.employee_position NOT NULL,
    color text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    archived_at timestamp with time zone,
    CONSTRAINT employees_color_check CHECK ((color ~ '^#[0-9a-fA-F]{6}$'::text))
);


--
-- Name: expenses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.expenses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization uuid NOT NULL,
    category text NOT NULL,
    description text NOT NULL,
    amount numeric(12,2) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    archived_at timestamp with time zone,
    CONSTRAINT expenses_amount_check CHECK ((amount > (0)::numeric))
);


--
-- Name: invoices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.invoices (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization uuid NOT NULL,
    client uuid NOT NULL,
    number integer NOT NULL,
    subtotal numeric(12,2) NOT NULL,
    discount numeric(12,2) DEFAULT 0 NOT NULL,
    discount_percent numeric(5,2) DEFAULT 0 NOT NULL,
    tax numeric(12,2) NOT NULL,
    previous_debt numeric(12,2) DEFAULT 0 NOT NULL,
    total numeric(12,2) NOT NULL,
    method public.pay_method NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT invoices_amounts_check CHECK (((subtotal >= (0)::numeric) AND (tax >= (0)::numeric) AND (previous_debt >= (0)::numeric) AND (total >= (0)::numeric))),
    CONSTRAINT invoices_discount_check CHECK (((discount >= (0)::numeric) AND (discount <= subtotal))),
    CONSTRAINT invoices_discount_percent_check CHECK (((discount_percent >= (0)::numeric) AND (discount_percent <= (100)::numeric)))
);


--
-- Name: invoices_item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.invoices_item (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization uuid NOT NULL,
    invoice uuid NOT NULL,
    description text NOT NULL,
    amount numeric(12,2) NOT NULL,
    area public.business_area NOT NULL,
    patient uuid NOT NULL,
    visit_service uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT invoices_item_amount_check CHECK ((amount >= (0)::numeric))
);


--
-- Name: migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.migrations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    delta integer NOT NULL,
    description text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: oauth_codes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.oauth_codes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code text NOT NULL,
    "user" uuid NOT NULL,
    ip text NOT NULL,
    user_agent text NOT NULL,
    redirect_uri text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: organizations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.organizations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    archived_at timestamp with time zone,
    CONSTRAINT organizations_slug_check CHECK ((slug ~ '^[a-z0-9-]+$'::text))
);


--
-- Name: owners; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.owners (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization uuid NOT NULL,
    "user" uuid NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    description text,
    phone text,
    avatar text,
    "position" text,
    occupation text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    archived_at timestamp with time zone
);


--
-- Name: patients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.patients (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization uuid NOT NULL,
    client uuid NOT NULL,
    name text NOT NULL,
    species public.species NOT NULL,
    breed text,
    sex public.patient_sex,
    birth_date date,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    archived_at timestamp with time zone
);


--
-- Name: patients_medical_record; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.patients_medical_record (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization uuid NOT NULL,
    patient uuid NOT NULL,
    allergies text[] DEFAULT '{}'::text[] NOT NULL,
    aggressive boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    archived_at timestamp with time zone
);


--
-- Name: patients_vaccination; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.patients_vaccination (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization uuid NOT NULL,
    patient uuid NOT NULL,
    vaccine text NOT NULL,
    applied_at timestamp with time zone NOT NULL,
    next_due_at date,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    archived_at timestamp with time zone,
    CONSTRAINT patients_vaccination_next_due_at_check CHECK ((next_due_at >= (applied_at)::date))
);


--
-- Name: permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.permissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "user" uuid NOT NULL,
    name text NOT NULL,
    permissions text[] DEFAULT '{}'::text[] NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: portals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.portals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization uuid NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    purpose public.portal_purpose NOT NULL,
    campaign_name text,
    status public.portal_status DEFAULT 'draft'::public.portal_status NOT NULL,
    palette_primary text NOT NULL,
    palette_accent text NOT NULL,
    palette_background text NOT NULL,
    markdown text NOT NULL,
    logo_url text NOT NULL,
    vet_policy public.vet_policy NOT NULL,
    default_vet uuid,
    default_reason text,
    auto_confirm boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    archived_at timestamp with time zone,
    CONSTRAINT portals_palette_check CHECK (((palette_primary ~ '^#[0-9a-fA-F]{6}$'::text) AND (palette_accent ~ '^#[0-9a-fA-F]{6}$'::text) AND (palette_background ~ '^#[0-9a-fA-F]{6}$'::text))),
    CONSTRAINT portals_slug_check CHECK ((slug ~ '^[a-z0-9-]+$'::text))
);


--
-- Name: portals_answer; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.portals_answer (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization uuid NOT NULL,
    submission uuid NOT NULL,
    field uuid,
    field_name text NOT NULL,
    field_label text NOT NULL,
    field_type public.field_type NOT NULL,
    binding public.field_binding,
    stage_title text NOT NULL,
    "position" integer NOT NULL,
    value_text text,
    option uuid,
    option_label text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT portals_answer_position_check CHECK (("position" >= 0))
);


--
-- Name: portals_field; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.portals_field (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization uuid NOT NULL,
    portal uuid NOT NULL,
    stage uuid NOT NULL,
    name text NOT NULL,
    label text NOT NULL,
    help_text text,
    placeholder text,
    type public.field_type NOT NULL,
    binding public.field_binding,
    required boolean DEFAULT false NOT NULL,
    "position" integer NOT NULL,
    active boolean DEFAULT true NOT NULL,
    min_length integer,
    max_length integer,
    min_value numeric,
    max_value numeric,
    min_date date,
    max_date date,
    options_source public.options_source,
    min_selected integer,
    max_selected integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    archived_at timestamp with time zone,
    CONSTRAINT portals_field_date_check CHECK ((min_date <= max_date)),
    CONSTRAINT portals_field_length_check CHECK ((min_length <= max_length)),
    CONSTRAINT portals_field_position_check CHECK (("position" >= 0)),
    CONSTRAINT portals_field_selected_check CHECK ((min_selected <= max_selected)),
    CONSTRAINT portals_field_value_check CHECK ((min_value <= max_value))
);


--
-- Name: portals_field_option; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.portals_field_option (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization uuid NOT NULL,
    field uuid NOT NULL,
    value text NOT NULL,
    label text NOT NULL,
    "position" integer NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    archived_at timestamp with time zone,
    CONSTRAINT portals_field_option_position_check CHECK (("position" >= 0))
);


--
-- Name: portals_stage; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.portals_stage (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization uuid NOT NULL,
    portal uuid NOT NULL,
    name text NOT NULL,
    title text NOT NULL,
    description text,
    "position" integer NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    archived_at timestamp with time zone,
    CONSTRAINT portals_stage_position_check CHECK (("position" >= 0))
);


--
-- Name: portals_submission; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.portals_submission (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization uuid NOT NULL,
    portal uuid NOT NULL,
    idempotency_key text NOT NULL,
    status public.submission_status DEFAULT 'received'::public.submission_status NOT NULL,
    rejection_reason public.rejection_reason,
    needs_review boolean DEFAULT false NOT NULL,
    client uuid,
    patient uuid,
    appointment uuid,
    campaign_name text,
    reviewed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    archived_at timestamp with time zone
);


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization uuid NOT NULL,
    name text NOT NULL,
    category public.product_category NOT NULL,
    stock integer DEFAULT 0 NOT NULL,
    min_stock integer DEFAULT 0 NOT NULL,
    price numeric(12,2) NOT NULL,
    expiry date,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    archived_at timestamp with time zone,
    CONSTRAINT products_price_check CHECK ((price >= (0)::numeric)),
    CONSTRAINT products_stock_check CHECK (((stock >= 0) AND (min_stock >= 0)))
);


--
-- Name: services; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.services (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization uuid NOT NULL,
    type public.service_type NOT NULL,
    name text NOT NULL,
    price numeric(12,2) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    archived_at timestamp with time zone,
    CONSTRAINT services_price_check CHECK ((price >= (0)::numeric))
);


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "user" uuid NOT NULL,
    ip text NOT NULL,
    user_agent text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: superadmins; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.superadmins (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization uuid NOT NULL,
    "user" uuid NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    avatar text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    archived_at timestamp with time zone
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization uuid NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    role public.role NOT NULL,
    email_confirmed boolean DEFAULT false NOT NULL,
    email_confirmed_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    banned_until timestamp with time zone,
    disabled boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    archived_at timestamp with time zone,
    CONSTRAINT users_email_check CHECK ((email = lower(email)))
);


--
-- Name: visits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.visits (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization uuid NOT NULL,
    client uuid NOT NULL,
    invoice uuid,
    started boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    archived_at timestamp with time zone
);


--
-- Name: visits_service; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.visits_service (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization uuid NOT NULL,
    visit uuid NOT NULL,
    patient uuid NOT NULL,
    service uuid,
    type public.service_type NOT NULL,
    label text NOT NULL,
    price numeric(12,2) NOT NULL,
    status public.visit_service_status NOT NULL,
    started boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    archived_at timestamp with time zone,
    CONSTRAINT visits_service_price_check CHECK ((price >= (0)::numeric))
);


--
-- Name: visits_service_grooming; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.visits_service_grooming (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization uuid NOT NULL,
    visit_service uuid NOT NULL,
    groomer uuid,
    belongings text DEFAULT ''::text NOT NULL,
    started_at timestamp with time zone,
    finished_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    archived_at timestamp with time zone,
    CONSTRAINT visits_service_grooming_finished_at_check CHECK ((finished_at >= started_at))
);


--
-- Name: visits_service_lab; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.visits_service_lab (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization uuid NOT NULL,
    visit_service uuid NOT NULL,
    result text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: visits_service_product; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.visits_service_product (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization uuid NOT NULL,
    visit_service uuid NOT NULL,
    product uuid,
    consultation uuid,
    quantity integer NOT NULL,
    unit_price numeric(12,2) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT visits_service_product_quantity_check CHECK ((quantity > 0)),
    CONSTRAINT visits_service_product_unit_price_check CHECK ((unit_price >= (0)::numeric))
);


--
-- Data for Name: account_tokens; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.account_tokens (id, "user", type, token, data, expires_at, created_at) FROM stdin;
\.


--
-- Data for Name: appointments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.appointments (id, organization, patient, vet, starts_at, duration_minutes, reason, status, source, created_at, updated_at, archived_at) FROM stdin;
339ef014-c599-4d59-ac20-1020a5ea2b26	1e1a2572-62cc-438d-87c0-3707f8bb59b9	a652e44d-84f8-48a5-bd38-70794dae84e9	cbadb3d3-c4ee-413c-a3c6-cec639044044	2026-09-23 10:00:00-05	30	Consulta general y vacunación	confirmed	staff	2026-09-23 00:04:04.890183-05	2026-09-23 00:04:04.890183-05	\N
8ec42174-0756-403c-b5c9-f3df56b4a045	1e1a2572-62cc-438d-87c0-3707f8bb59b9	5aa7b211-4764-45f2-a1cd-b6185d05aa26	cbadb3d3-c4ee-413c-a3c6-cec639044044	2026-09-23 11:00:00-05	30	Chequeo de rutina	pending	portal	2026-09-23 00:04:04.890183-05	2026-09-23 00:04:04.890183-05	\N
c1c0aa9b-8f9e-4b3e-8eb6-e1be16196084	1e1a2572-62cc-438d-87c0-3707f8bb59b9	3c475ac3-8764-45a2-87ca-8c533f48d8ef	cbadb3d3-c4ee-413c-a3c6-cec639044044	2026-09-23 12:00:00-05	30	Corte y baño higiénico	completed	staff	2026-09-23 00:04:04.890183-05	2026-09-23 00:04:04.890183-05	\N
\.


--
-- Data for Name: appointments_availability; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.appointments_availability (id, organization, timezone, week, overrides, slot_minutes, buffer_before, buffer_after, min_notice_hours, max_advance_days, max_per_day, online_booking, auto_confirm, created_at, updated_at, archived_at) FROM stdin;
6fe4ddad-6e8a-4f40-ae50-208a43f5a0ca	1e1a2572-62cc-438d-87c0-3707f8bb59b9	America/Guayaquil	[{"ranges": [{"end": "18:00", "start": "09:00"}], "enabled": true, "weekday": "monday"}, {"ranges": [{"end": "18:00", "start": "09:00"}], "enabled": true, "weekday": "tuesday"}, {"ranges": [{"end": "18:00", "start": "09:00"}], "enabled": true, "weekday": "wednesday"}, {"ranges": [{"end": "18:00", "start": "09:00"}], "enabled": true, "weekday": "thursday"}, {"ranges": [{"end": "18:00", "start": "09:00"}], "enabled": true, "weekday": "friday"}, {"ranges": [{"end": "14:00", "start": "09:00"}], "enabled": true, "weekday": "saturday"}, {"ranges": [], "enabled": false, "weekday": "sunday"}]	[]	30	0	0	2	60	0	t	f	2026-09-23 00:04:04.890183-05	2026-09-23 00:04:04.890183-05	\N
\.


--
-- Data for Name: clients; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.clients (id, organization, name, phone, email, debt, created_at, updated_at, archived_at) FROM stdin;
ce7f2596-315f-4e29-abb9-c48873189d50	1e1a2572-62cc-438d-87c0-3707f8bb59b9	Carla Méndez	5551001	carla@correo.test	0.00	2026-09-23 00:01:38.724776-05	2026-09-23 00:01:38.724776-05	\N
f1de2a1f-9913-4139-bd45-c7ecce5feb32	1e1a2572-62cc-438d-87c0-3707f8bb59b9	Jorge Lara	5551002	jorge.lara@correo.test	0.00	2026-09-23 00:01:38.7315-05	2026-09-23 00:01:38.7315-05	\N
eb61a888-50ed-4c50-822f-a9d7856fb0c1	1e1a2572-62cc-438d-87c0-3707f8bb59b9	Carolina Ríos	5551003	carolina.rios@correo.test	0.00	2026-09-23 00:01:38.733069-05	2026-09-23 00:01:38.733069-05	\N
2b134c65-0bd4-4839-912b-470c2561a571	1e1a2572-62cc-438d-87c0-3707f8bb59b9	Marco Salazar	5551004	marco.salazar@correo.test	0.00	2026-09-23 00:01:38.734789-05	2026-09-23 00:01:38.734789-05	\N
e24431d1-69d2-4078-8d44-5d9f7dd336b5	1e1a2572-62cc-438d-87c0-3707f8bb59b9	Elena Buitrón	5551005	elena.buitron@correo.test	0.00	2026-09-23 00:01:38.735977-05	2026-09-23 00:01:38.735977-05	\N
\.


--
-- Data for Name: consultations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.consultations (id, organization, patient, vet, weight_kg, temperature_c, heart_rate_bpm, anamnesis, diagnosis, created_at) FROM stdin;
20d0ea50-7f3b-4658-bbf3-d7221ba81f90	1e1a2572-62cc-438d-87c0-3707f8bb59b9	a652e44d-84f8-48a5-bd38-70794dae84e9	cbadb3d3-c4ee-413c-a3c6-cec639044044	14.20	38.6	95	Paciente alegre, apetito normal, viene por chequeo anual	Paciente en excelente condición física	2026-09-23 00:04:04.890183-05
\.


--
-- Data for Name: consultations_prescription; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.consultations_prescription (id, organization, consultation, medication, dosage, created_at) FROM stdin;
ddaa0eea-17f6-4638-8284-068632a40a8a	1e1a2572-62cc-438d-87c0-3707f8bb59b9	20d0ea50-7f3b-4658-bbf3-d7221ba81f90	Complejo Vitamínico Canino	1 pastilla diaria por 30 días	2026-09-23 00:04:04.890183-05
\.


--
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.employees (id, organization, "user", first_name, last_name, phone, avatar, "position", color, created_at, updated_at, archived_at) FROM stdin;
cbadb3d3-c4ee-413c-a3c6-cec639044044	1e1a2572-62cc-438d-87c0-3707f8bb59b9	65518c76-7dd2-42fe-9c74-d961e1d233fe	Recepción	Demo	\N	\N	receptionist	\N	2026-09-23 00:01:38.706946-05	2026-09-23 00:01:38.706946-05	\N
\.


--
-- Data for Name: expenses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.expenses (id, organization, category, description, amount, created_at, updated_at, archived_at) FROM stdin;
dd34c86d-2f02-47e4-893a-236b913dbe8d	1e1a2572-62cc-438d-87c0-3707f8bb59b9	supplies	Reposición de descartables y gasas	120.00	2026-09-23 00:04:04.890183-05	2026-09-23 00:04:04.890183-05	\N
\.


--
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.invoices (id, organization, client, number, subtotal, discount, discount_percent, tax, previous_debt, total, method, created_at) FROM stdin;
f61e5153-6d07-4254-be11-9bb9b8ca220e	1e1a2572-62cc-438d-87c0-3707f8bb59b9	ce7f2596-315f-4e29-abb9-c48873189d50	1040	55.00	0.00	0.00	8.25	0.00	63.25	cash	2026-09-23 00:04:04.890183-05
1971d55b-be60-40ef-a4ae-57c3aa0eff48	1e1a2572-62cc-438d-87c0-3707f8bb59b9	f1de2a1f-9913-4139-bd45-c7ecce5feb32	1041	35.00	0.00	0.00	5.25	15.00	55.25	card	2026-09-23 00:04:04.890183-05
\.


--
-- Data for Name: invoices_item; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.invoices_item (id, organization, invoice, description, amount, area, patient, visit_service, created_at) FROM stdin;
dff6377a-8fe9-45d6-a8e2-c956f8fd6f86	1e1a2572-62cc-438d-87c0-3707f8bb59b9	f61e5153-6d07-4254-be11-9bb9b8ca220e	Consulta médica general	25.00	clinic	a652e44d-84f8-48a5-bd38-70794dae84e9	\N	2026-09-23 00:04:04.890183-05
b64eb9ae-bdf4-491d-b85d-717d355420ba	1e1a2572-62cc-438d-87c0-3707f8bb59b9	f61e5153-6d07-4254-be11-9bb9b8ca220e	Baño y corte premium	30.00	grooming	a652e44d-84f8-48a5-bd38-70794dae84e9	\N	2026-09-23 00:04:04.890183-05
260334f2-c948-428f-aa9d-6cb6760230cc	1e1a2572-62cc-438d-87c0-3707f8bb59b9	1971d55b-be60-40ef-a4ae-57c3aa0eff48	Hemograma completo	35.00	laboratory	5aa7b211-4764-45f2-a1cd-b6185d05aa26	\N	2026-09-23 00:04:04.890183-05
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.migrations (id, name, delta, description, created_at) FROM stdin;
8e0ea18c-cf98-4d6a-a09d-457f4dd24dd2	001-attach-permissions-records	1	Create the permissions row of every user without one, with every permission of its role	2026-09-23 00:01:38.31604-05
a3be2250-5b02-4ae1-a765-afb73fe47314	002-insert-demo-accounts	2	Insert demo accounts (non-production)	2026-09-23 00:01:38.713867-05
484dcabe-22f7-4852-a447-62a8deb0994f	003-attach-clients-permissions	3	Attach clients, clients-count and clients-patients permissions to owner and employee users	2026-09-23 00:01:38.719794-05
4693250e-d189-402d-b664-707c31ea292a	004-attach-organizations-permissions	4	Attach organizations permission to superadmin users	2026-09-23 00:01:38.721759-05
9bed604c-4ab7-4659-a01c-61fba4e91d47	005-insert-wave1-demo-data	5	Insert wave 1 demo clients and patients (non-production)	2026-09-23 00:01:38.737116-05
9aff658b-d2c7-4069-84cb-b31ad31475d8	006-attach-wave2-permissions	6	Attach wave 2 permissions to owner and employee users	2026-09-23 00:01:38.740289-05
f8055fc8-8cf9-4057-8c43-75094aa45bd9	007-insert-wave2-demo-data	7	Insert wave 2 demo data (appointments, visits, clinic, inventory, billing, finance, portals)	2026-09-23 00:04:04.928462-05
bf36bd7e-44a3-466c-95a9-ccd8e3bbb1cb	008-attach-wave3-permissions	8	Attach wave 3 dashboard permissions to owner and employee users	2026-09-23 00:04:04.934321-05
\.


--
-- Data for Name: oauth_codes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.oauth_codes (id, code, "user", ip, user_agent, redirect_uri, expires_at, created_at) FROM stdin;
\.


--
-- Data for Name: organizations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.organizations (id, name, slug, created_at, updated_at, archived_at) FROM stdin;
1b0e214d-3c39-4fa4-ace5-5b404d8aebe7	VetiSuite	vetisuite	2026-09-23 00:01:38.365474-05	2026-09-23 00:01:38.365474-05	\N
1e1a2572-62cc-438d-87c0-3707f8bb59b9	Clínica Demo	clinica-demo	2026-09-23 00:01:38.575538-05	2026-09-23 00:01:38.575538-05	\N
\.


--
-- Data for Name: owners; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.owners (id, organization, "user", first_name, last_name, description, phone, avatar, "position", occupation, created_at, updated_at, archived_at) FROM stdin;
f5061a17-2d14-4a18-91a6-a331046c3477	1e1a2572-62cc-438d-87c0-3707f8bb59b9	1812cb09-72b3-4ade-9db9-2bda70b5e9d4	Dueña	Demo	\N	\N	\N	\N	\N	2026-09-23 00:01:38.643964-05	2026-09-23 00:01:38.643964-05	\N
\.


--
-- Data for Name: patients; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.patients (id, organization, client, name, species, breed, sex, birth_date, created_at, updated_at, archived_at) FROM stdin;
a652e44d-84f8-48a5-bd38-70794dae84e9	1e1a2572-62cc-438d-87c0-3707f8bb59b9	ce7f2596-315f-4e29-abb9-c48873189d50	Firulais	dog	Golden Retriever	male	2021-03-15	2026-09-23 00:01:38.726755-05	2026-09-23 00:01:38.726755-05	\N
5aa7b211-4764-45f2-a1cd-b6185d05aa26	1e1a2572-62cc-438d-87c0-3707f8bb59b9	f1de2a1f-9913-4139-bd45-c7ecce5feb32	Michi	cat	Siamés	female	2022-07-20	2026-09-23 00:01:38.732293-05	2026-09-23 00:01:38.732293-05	\N
3c475ac3-8764-45a2-87ca-8c533f48d8ef	1e1a2572-62cc-438d-87c0-3707f8bb59b9	eb61a888-50ed-4c50-822f-a9d7856fb0c1	Max	dog	Labrador	male	2020-11-10	2026-09-23 00:01:38.733662-05	2026-09-23 00:01:38.733662-05	\N
e7303b66-08af-4513-8495-71b5d4f532bb	1e1a2572-62cc-438d-87c0-3707f8bb59b9	eb61a888-50ed-4c50-822f-a9d7856fb0c1	Luna	cat	Persa	female	2023-01-05	2026-09-23 00:01:38.734236-05	2026-09-23 00:01:38.734236-05	\N
1820e246-6d40-4e73-b095-c41177409105	1e1a2572-62cc-438d-87c0-3707f8bb59b9	2b134c65-0bd4-4839-912b-470c2561a571	Rocky	dog	Bulldog Francés	male	2019-09-18	2026-09-23 00:01:38.735403-05	2026-09-23 00:01:38.735403-05	\N
a55a3aca-97bf-49d1-9749-8f649748114f	1e1a2572-62cc-438d-87c0-3707f8bb59b9	e24431d1-69d2-4078-8d44-5d9f7dd336b5	Kiwi	bird	Periquito Australiano	female	2023-04-12	2026-09-23 00:01:38.736508-05	2026-09-23 00:01:38.736508-05	\N
\.


--
-- Data for Name: patients_medical_record; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.patients_medical_record (id, organization, patient, allergies, aggressive, created_at, updated_at, archived_at) FROM stdin;
\.


--
-- Data for Name: patients_vaccination; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.patients_vaccination (id, organization, patient, vaccine, applied_at, next_due_at, created_at, updated_at, archived_at) FROM stdin;
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.permissions (id, "user", name, permissions, created_at, updated_at) FROM stdin;
f57b9834-93eb-4236-8c60-973275f0de42	679e8243-58af-44c2-83dc-449eec76b967	general	{superadmin::auth-logout::general,superadmin::files::general,superadmin::organizations::general,superadmin::owners::general,superadmin::owners-disable::general,superadmin::owners-permissions::general,superadmin::profile::general,superadmin::profile-email-verification::general,superadmin::profile-password::general,superadmin::profile-sessions::general,superadmin::superadmins::general,superadmin::superadmins-disable::general,superadmin::superadmins-permissions::general,superadmin::uploads::general}	2026-09-23 00:01:38.430853-05	2026-09-23 00:01:38.721-05
348c1a7e-ddc8-4b32-a6f0-a9dc81551f7f	65518c76-7dd2-42fe-9c74-d961e1d233fe	general	{employee::appointments::general,employee::appointments-availability::general,employee::appointments-count::general,employee::auth-logout::general,employee::billing::general,employee::billing-count::general,employee::clients::general,employee::clients-count::general,employee::clients-patients::general,employee::clinic::general,employee::clinic-count::general,employee::dashboard-billing::general,employee::dashboard-care::general,employee::dashboard-grooming::general,employee::dashboard-inventory::general,employee::dashboard-laboratory::general,employee::dashboard-marketing::general,employee::dashboard-reception::general,employee::files::general,employee::finance::general,employee::inventory::general,employee::inventory-count::general,employee::portals::general,employee::portals-count::general,employee::profile::general,employee::profile-email-verification::general,employee::profile-password::general,employee::profile-sessions::general,employee::uploads::general,employee::visits::general,employee::visits-count::general,employee::visits-grooming::general,employee::visits-grooming-count::general,employee::visits-status::general}	2026-09-23 00:01:38.710515-05	2026-09-23 00:04:04.933-05
d8a9f1e3-dd3a-4676-a892-8dc57c18e8fc	1812cb09-72b3-4ade-9db9-2bda70b5e9d4	general	{owner::appointments::general,owner::appointments-availability::general,owner::appointments-count::general,owner::auth-logout::general,owner::billing::general,owner::billing-count::general,owner::clients::general,owner::clients-count::general,owner::clients-patients::general,owner::clinic::general,owner::clinic-count::general,owner::dashboard-administration::general,owner::dashboard-billing::general,owner::dashboard-care::general,owner::dashboard-grooming::general,owner::dashboard-inventory::general,owner::dashboard-laboratory::general,owner::dashboard-marketing::general,owner::dashboard-reception::general,owner::employees::general,owner::employees-disable::general,owner::employees-permissions::general,owner::files::general,owner::finance::general,owner::inventory::general,owner::inventory-count::general,owner::portals::general,owner::portals-count::general,owner::profile::general,owner::profile-email-verification::general,owner::profile-password::general,owner::profile-sessions::general,owner::uploads::general,owner::visits::general,owner::visits-count::general,owner::visits-grooming::general,owner::visits-grooming-count::general,owner::visits-status::general}	2026-09-23 00:01:38.64701-05	2026-09-23 00:04:04.932-05
\.


--
-- Data for Name: portals; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.portals (id, organization, name, slug, purpose, campaign_name, status, palette_primary, palette_accent, palette_background, markdown, logo_url, vet_policy, default_vet, default_reason, auto_confirm, created_at, updated_at, archived_at) FROM stdin;
65353028-6967-49c4-aeef-a72cab807423	1e1a2572-62cc-438d-87c0-3707f8bb59b9	Portal Principal de Reservas	reservas-central	booking	\N	published	#2563eb	#3b82f6	#f8fafc	# Agenda tu cita médica veterinaria en línea\nSelecciona el profesional y horario conveniente.	https://images.vetisuite.test/logo-demo.png	clinic_assigns	\N	\N	t	2026-09-23 00:04:04.890183-05	2026-09-23 00:04:04.890183-05	\N
9242a5d6-52e8-4ad6-8e49-38c37bddab0a	1e1a2572-62cc-438d-87c0-3707f8bb59b9	Campaña Vacunación 2026	vacunacion-2026	capture	\N	draft	#059669	#10b981	#f0fdf4	# Registro Anticipado de Vacunación\nRegistra a tu mascota para acceder a descuentos.	https://images.vetisuite.test/vacuna-demo.png	clinic_assigns	\N	\N	f	2026-09-23 00:04:04.890183-05	2026-09-23 00:04:04.890183-05	\N
\.


--
-- Data for Name: portals_answer; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.portals_answer (id, organization, submission, field, field_name, field_label, field_type, binding, stage_title, "position", value_text, option, option_label, created_at) FROM stdin;
\.


--
-- Data for Name: portals_field; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.portals_field (id, organization, portal, stage, name, label, help_text, placeholder, type, binding, required, "position", active, min_length, max_length, min_value, max_value, min_date, max_date, options_source, min_selected, max_selected, created_at, updated_at, archived_at) FROM stdin;
\.


--
-- Data for Name: portals_field_option; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.portals_field_option (id, organization, field, value, label, "position", active, created_at, updated_at, archived_at) FROM stdin;
\.


--
-- Data for Name: portals_stage; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.portals_stage (id, organization, portal, name, title, description, "position", active, created_at, updated_at, archived_at) FROM stdin;
\.


--
-- Data for Name: portals_submission; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.portals_submission (id, organization, portal, idempotency_key, status, rejection_reason, needs_review, client, patient, appointment, campaign_name, reviewed_at, created_at, updated_at, archived_at) FROM stdin;
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.products (id, organization, name, category, stock, min_stock, price, expiry, created_at, updated_at, archived_at) FROM stdin;
a5cc6086-f68f-4e25-b06c-83b9cfe9d155	1e1a2572-62cc-438d-87c0-3707f8bb59b9	Vacuna Séxtuple Canina	vaccines	45	10	22.50	2027-03-15	2026-09-23 00:04:04.890183-05	2026-09-23 00:04:04.890183-05	\N
a2fc8deb-7ac1-4bd1-aba4-c147103b1aac	1e1a2572-62cc-438d-87c0-3707f8bb59b9	Amoxicilina + Ácido Clavulánico 250mg	medications	80	20	15.00	2026-11-20	2026-09-23 00:04:04.890183-05	2026-09-23 00:04:04.890183-05	\N
6af43d60-f431-4293-95d9-543689dd3298	1e1a2572-62cc-438d-87c0-3707f8bb59b9	Shampoo Hipoalergénico Avena 500ml	grooming	18	5	18.00	2028-01-10	2026-09-23 00:04:04.890183-05	2026-09-23 00:04:04.890183-05	\N
39de2b25-3e0e-4bd0-8dee-892b84b0e0c9	1e1a2572-62cc-438d-87c0-3707f8bb59b9	Alimento Premium Adulto 15kg	food	12	4	65.00	2026-12-05	2026-09-23 00:04:04.890183-05	2026-09-23 00:04:04.890183-05	\N
6c2d11ef-81c6-4b8f-b1bc-c30d18abe195	1e1a2572-62cc-438d-87c0-3707f8bb59b9	Jeringas Descartables 3ml x 100	supplies	25	5	12.00	2029-06-30	2026-09-23 00:04:04.890183-05	2026-09-23 00:04:04.890183-05	\N
\.


--
-- Data for Name: services; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.services (id, organization, type, name, price, created_at, updated_at, archived_at) FROM stdin;
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sessions (id, "user", ip, user_agent, expires_at, created_at) FROM stdin;
9e55aa7e-9b06-4d23-af7a-259236de6359	679e8243-58af-44c2-83dc-449eec76b967	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	2026-09-25 00:05:17.412-05	2026-09-23 00:05:17.412825-05
\.


--
-- Data for Name: superadmins; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.superadmins (id, organization, "user", first_name, last_name, avatar, created_at, updated_at, archived_at) FROM stdin;
e2d92ab4-a804-42fc-9655-e56a7202230c	1b0e214d-3c39-4fa4-ace5-5b404d8aebe7	679e8243-58af-44c2-83dc-449eec76b967	Superadmin	VetiSuite	\N	2026-09-23 00:01:38.428234-05	2026-09-23 00:01:38.428234-05	\N
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, organization, email, password, role, email_confirmed, email_confirmed_at, last_sign_in_at, banned_until, disabled, created_at, updated_at, archived_at) FROM stdin;
1812cb09-72b3-4ade-9db9-2bda70b5e9d4	1e1a2572-62cc-438d-87c0-3707f8bb59b9	demo+owner@vetisuite.com	$2b$10$aGqbfF0z7dYMIuHpUZBbTOSObIoadgzBdh0sB8sa1D/NK0gFttZO.	owner	f	\N	\N	\N	f	2026-09-23 00:01:38.642259-05	2026-09-23 00:01:38.642259-05	\N
65518c76-7dd2-42fe-9c74-d961e1d233fe	1e1a2572-62cc-438d-87c0-3707f8bb59b9	demo+employee@vetisuite.com	$2b$10$SagUl5wTGUHWAuZ675lMmeZg0FHUZT.UIAMQsJVHgt9nH0L7gQifO	employee	f	\N	\N	\N	f	2026-09-23 00:01:38.705424-05	2026-09-23 00:01:38.705424-05	\N
679e8243-58af-44c2-83dc-449eec76b967	1b0e214d-3c39-4fa4-ace5-5b404d8aebe7	demo+superadmin@vetisuite.com	$2b$10$.8VjbTOgtaxBTQEms7xqE.RGB55EjbuxsX/nEZFffxkT9jXydbR3C	superadmin	f	\N	2026-09-23 00:05:17.415-05	\N	f	2026-09-23 00:01:38.425676-05	2026-09-23 00:05:17.415-05	\N
\.


--
-- Data for Name: visits; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.visits (id, organization, client, invoice, started, created_at, updated_at, archived_at) FROM stdin;
c8f94e7f-3587-4fe7-b85d-a7cd2daa80b4	1e1a2572-62cc-438d-87c0-3707f8bb59b9	ce7f2596-315f-4e29-abb9-c48873189d50	\N	t	2026-09-23 00:04:04.890183-05	2026-09-23 00:04:04.890183-05	\N
782129e1-98b8-40e1-a825-39ff82256ce8	1e1a2572-62cc-438d-87c0-3707f8bb59b9	f1de2a1f-9913-4139-bd45-c7ecce5feb32	\N	t	2026-09-23 00:04:04.890183-05	2026-09-23 00:04:04.890183-05	\N
\.


--
-- Data for Name: visits_service; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.visits_service (id, organization, visit, patient, service, type, label, price, status, started, created_at, updated_at, archived_at) FROM stdin;
5efa6635-03e5-4a29-b219-73b7f10109b1	1e1a2572-62cc-438d-87c0-3707f8bb59b9	c8f94e7f-3587-4fe7-b85d-a7cd2daa80b4	a652e44d-84f8-48a5-bd38-70794dae84e9	\N	veterinary	Consulta médica general	25.00	done	t	2026-09-23 00:04:04.890183-05	2026-09-23 00:04:04.890183-05	\N
7210a99a-7e16-4995-a53f-debdc7e34481	1e1a2572-62cc-438d-87c0-3707f8bb59b9	c8f94e7f-3587-4fe7-b85d-a7cd2daa80b4	a652e44d-84f8-48a5-bd38-70794dae84e9	\N	grooming	Baño y corte premium	30.00	in_progress	t	2026-09-23 00:04:04.890183-05	2026-09-23 00:04:04.890183-05	\N
1f663a7a-9e64-4e22-bdc7-c0dfb2d98b91	1e1a2572-62cc-438d-87c0-3707f8bb59b9	782129e1-98b8-40e1-a825-39ff82256ce8	5aa7b211-4764-45f2-a1cd-b6185d05aa26	\N	laboratory	Hemograma completo	35.00	resulted	t	2026-09-23 00:04:04.890183-05	2026-09-23 00:04:04.890183-05	\N
\.


--
-- Data for Name: visits_service_grooming; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.visits_service_grooming (id, organization, visit_service, groomer, belongings, started_at, finished_at, created_at, updated_at, archived_at) FROM stdin;
b46f3208-ce1b-4dc0-b051-c5dd05ce0857	1e1a2572-62cc-438d-87c0-3707f8bb59b9	7210a99a-7e16-4995-a53f-debdc7e34481	cbadb3d3-c4ee-413c-a3c6-cec639044044	Collar rojo y correa	\N	\N	2026-09-23 00:04:04.890183-05	2026-09-23 00:04:04.890183-05	\N
\.


--
-- Data for Name: visits_service_lab; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.visits_service_lab (id, organization, visit_service, result, created_at) FROM stdin;
06cd8b78-c7b1-42ec-aae7-dbeed655df2f	1e1a2572-62cc-438d-87c0-3707f8bb59b9	1f663a7a-9e64-4e22-bdc7-c0dfb2d98b91	Hemograma dentro de parámetros normales. Leucocitos y plaquetas correctos.	2026-09-23 00:04:04.890183-05
\.


--
-- Data for Name: visits_service_product; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.visits_service_product (id, organization, visit_service, product, consultation, quantity, unit_price, created_at) FROM stdin;
\.


--
-- Name: account_tokens account_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.account_tokens
    ADD CONSTRAINT account_tokens_pkey PRIMARY KEY (id);


--
-- Name: appointments_availability appointments_availability_organization_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments_availability
    ADD CONSTRAINT appointments_availability_organization_unique UNIQUE (organization);


--
-- Name: appointments_availability appointments_availability_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments_availability
    ADD CONSTRAINT appointments_availability_pkey PRIMARY KEY (id);


--
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);


--
-- Name: clients clients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_pkey PRIMARY KEY (id);


--
-- Name: consultations consultations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.consultations
    ADD CONSTRAINT consultations_pkey PRIMARY KEY (id);


--
-- Name: consultations_prescription consultations_prescription_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.consultations_prescription
    ADD CONSTRAINT consultations_prescription_pkey PRIMARY KEY (id);


--
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- Name: employees employees_user_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_user_unique UNIQUE ("user");


--
-- Name: expenses expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_pkey PRIMARY KEY (id);


--
-- Name: invoices_item invoices_item_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices_item
    ADD CONSTRAINT invoices_item_pkey PRIMARY KEY (id);


--
-- Name: invoices invoices_organization_number_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_organization_number_unique UNIQUE (organization, number);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_delta_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_delta_unique UNIQUE (delta);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: oauth_codes oauth_codes_code_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.oauth_codes
    ADD CONSTRAINT oauth_codes_code_unique UNIQUE (code);


--
-- Name: oauth_codes oauth_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.oauth_codes
    ADD CONSTRAINT oauth_codes_pkey PRIMARY KEY (id);


--
-- Name: organizations organizations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_pkey PRIMARY KEY (id);


--
-- Name: organizations organizations_slug_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_slug_unique UNIQUE (slug);


--
-- Name: owners owners_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.owners
    ADD CONSTRAINT owners_pkey PRIMARY KEY (id);


--
-- Name: owners owners_user_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.owners
    ADD CONSTRAINT owners_user_unique UNIQUE ("user");


--
-- Name: patients_medical_record patients_medical_record_patient_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patients_medical_record
    ADD CONSTRAINT patients_medical_record_patient_unique UNIQUE (patient);


--
-- Name: patients_medical_record patients_medical_record_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patients_medical_record
    ADD CONSTRAINT patients_medical_record_pkey PRIMARY KEY (id);


--
-- Name: patients patients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_pkey PRIMARY KEY (id);


--
-- Name: patients_vaccination patients_vaccination_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patients_vaccination
    ADD CONSTRAINT patients_vaccination_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_user_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_user_unique UNIQUE ("user");


--
-- Name: portals_answer portals_answer_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portals_answer
    ADD CONSTRAINT portals_answer_pkey PRIMARY KEY (id);


--
-- Name: portals_field_option portals_field_option_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portals_field_option
    ADD CONSTRAINT portals_field_option_pkey PRIMARY KEY (id);


--
-- Name: portals_field portals_field_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portals_field
    ADD CONSTRAINT portals_field_pkey PRIMARY KEY (id);


--
-- Name: portals_field portals_field_portal_name_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portals_field
    ADD CONSTRAINT portals_field_portal_name_unique UNIQUE (portal, name);


--
-- Name: portals portals_organization_slug_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portals
    ADD CONSTRAINT portals_organization_slug_unique UNIQUE (organization, slug);


--
-- Name: portals portals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portals
    ADD CONSTRAINT portals_pkey PRIMARY KEY (id);


--
-- Name: portals_stage portals_stage_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portals_stage
    ADD CONSTRAINT portals_stage_pkey PRIMARY KEY (id);


--
-- Name: portals_stage portals_stage_portal_name_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portals_stage
    ADD CONSTRAINT portals_stage_portal_name_unique UNIQUE (portal, name);


--
-- Name: portals_submission portals_submission_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portals_submission
    ADD CONSTRAINT portals_submission_pkey PRIMARY KEY (id);


--
-- Name: portals_submission portals_submission_portal_idempotencyKey_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portals_submission
    ADD CONSTRAINT "portals_submission_portal_idempotencyKey_unique" UNIQUE (portal, idempotency_key);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: services services_organization_type_name_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_organization_type_name_unique UNIQUE (organization, type, name);


--
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: superadmins superadmins_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.superadmins
    ADD CONSTRAINT superadmins_pkey PRIMARY KEY (id);


--
-- Name: superadmins superadmins_user_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.superadmins
    ADD CONSTRAINT superadmins_user_unique UNIQUE ("user");


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_organization_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_organization_email_unique UNIQUE (organization, email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: visits visits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.visits
    ADD CONSTRAINT visits_pkey PRIMARY KEY (id);


--
-- Name: visits_service_grooming visits_service_grooming_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.visits_service_grooming
    ADD CONSTRAINT visits_service_grooming_pkey PRIMARY KEY (id);


--
-- Name: visits_service_grooming visits_service_grooming_visit_service_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.visits_service_grooming
    ADD CONSTRAINT visits_service_grooming_visit_service_unique UNIQUE (visit_service);


--
-- Name: visits_service_lab visits_service_lab_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.visits_service_lab
    ADD CONSTRAINT visits_service_lab_pkey PRIMARY KEY (id);


--
-- Name: visits_service_lab visits_service_lab_visit_service_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.visits_service_lab
    ADD CONSTRAINT visits_service_lab_visit_service_unique UNIQUE (visit_service);


--
-- Name: visits_service visits_service_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.visits_service
    ADD CONSTRAINT visits_service_pkey PRIMARY KEY (id);


--
-- Name: visits_service_product visits_service_product_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.visits_service_product
    ADD CONSTRAINT visits_service_product_pkey PRIMARY KEY (id);


--
-- Name: visits_service_product visits_service_product_visit_service_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.visits_service_product
    ADD CONSTRAINT visits_service_product_visit_service_unique UNIQUE (visit_service);


--
-- Name: account_tokens_user_type_index; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX account_tokens_user_type_index ON public.account_tokens USING btree ("user", type);


--
-- Name: appointments_organization_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX appointments_organization_index ON public.appointments USING btree (organization);


--
-- Name: appointments_vet_starts_at_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX appointments_vet_starts_at_unique ON public.appointments USING btree (vet, starts_at) WHERE ((status <> 'cancelled'::public.appointment_status) AND (archived_at IS NULL));


--
-- Name: clients_organization_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX clients_organization_index ON public.clients USING btree (organization);


--
-- Name: consultations_organization_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX consultations_organization_index ON public.consultations USING btree (organization);


--
-- Name: consultations_prescription_organization_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX consultations_prescription_organization_index ON public.consultations_prescription USING btree (organization);


--
-- Name: employees_organization_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX employees_organization_index ON public.employees USING btree (organization);


--
-- Name: expenses_organization_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX expenses_organization_index ON public.expenses USING btree (organization);


--
-- Name: invoices_item_organization_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX invoices_item_organization_index ON public.invoices_item USING btree (organization);


--
-- Name: oauth_codes_user_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX oauth_codes_user_index ON public.oauth_codes USING btree ("user");


--
-- Name: owners_organization_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX owners_organization_index ON public.owners USING btree (organization);


--
-- Name: patients_medical_record_organization_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX patients_medical_record_organization_index ON public.patients_medical_record USING btree (organization);


--
-- Name: patients_organization_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX patients_organization_index ON public.patients USING btree (organization);


--
-- Name: patients_vaccination_organization_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX patients_vaccination_organization_index ON public.patients_vaccination USING btree (organization);


--
-- Name: portals_answer_organization_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX portals_answer_organization_index ON public.portals_answer USING btree (organization);


--
-- Name: portals_field_option_organization_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX portals_field_option_organization_index ON public.portals_field_option USING btree (organization);


--
-- Name: portals_field_organization_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX portals_field_organization_index ON public.portals_field USING btree (organization);


--
-- Name: portals_stage_organization_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX portals_stage_organization_index ON public.portals_stage USING btree (organization);


--
-- Name: portals_submission_organization_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX portals_submission_organization_index ON public.portals_submission USING btree (organization);


--
-- Name: products_organization_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX products_organization_index ON public.products USING btree (organization);


--
-- Name: sessions_user_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sessions_user_index ON public.sessions USING btree ("user");


--
-- Name: superadmins_organization_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX superadmins_organization_index ON public.superadmins USING btree (organization);


--
-- Name: visits_open_client_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX visits_open_client_unique ON public.visits USING btree (client) WHERE ((invoice IS NULL) AND (archived_at IS NULL));


--
-- Name: visits_organization_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX visits_organization_index ON public.visits USING btree (organization);


--
-- Name: visits_service_grooming_organization_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX visits_service_grooming_organization_index ON public.visits_service_grooming USING btree (organization);


--
-- Name: visits_service_lab_organization_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX visits_service_lab_organization_index ON public.visits_service_lab USING btree (organization);


--
-- Name: visits_service_organization_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX visits_service_organization_index ON public.visits_service USING btree (organization);


--
-- Name: visits_service_product_organization_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX visits_service_product_organization_index ON public.visits_service_product USING btree (organization);


--
-- Name: account_tokens account_tokens_user_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.account_tokens
    ADD CONSTRAINT account_tokens_user_users_id_fk FOREIGN KEY ("user") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: appointments_availability appointments_availability_organization_organizations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments_availability
    ADD CONSTRAINT appointments_availability_organization_organizations_id_fk FOREIGN KEY (organization) REFERENCES public.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: appointments appointments_organization_organizations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_organization_organizations_id_fk FOREIGN KEY (organization) REFERENCES public.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: appointments appointments_patient_patients_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_patient_patients_id_fk FOREIGN KEY (patient) REFERENCES public.patients(id) ON UPDATE CASCADE;


--
-- Name: appointments appointments_vet_employees_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_vet_employees_id_fk FOREIGN KEY (vet) REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: clients clients_organization_organizations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_organization_organizations_id_fk FOREIGN KEY (organization) REFERENCES public.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: consultations consultations_organization_organizations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.consultations
    ADD CONSTRAINT consultations_organization_organizations_id_fk FOREIGN KEY (organization) REFERENCES public.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: consultations consultations_patient_patients_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.consultations
    ADD CONSTRAINT consultations_patient_patients_id_fk FOREIGN KEY (patient) REFERENCES public.patients(id) ON UPDATE CASCADE;


--
-- Name: consultations_prescription consultations_prescription_consultation_consultations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.consultations_prescription
    ADD CONSTRAINT consultations_prescription_consultation_consultations_id_fk FOREIGN KEY (consultation) REFERENCES public.consultations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: consultations_prescription consultations_prescription_organization_organizations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.consultations_prescription
    ADD CONSTRAINT consultations_prescription_organization_organizations_id_fk FOREIGN KEY (organization) REFERENCES public.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: consultations consultations_vet_employees_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.consultations
    ADD CONSTRAINT consultations_vet_employees_id_fk FOREIGN KEY (vet) REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: employees employees_organization_organizations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_organization_organizations_id_fk FOREIGN KEY (organization) REFERENCES public.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: employees employees_user_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_user_users_id_fk FOREIGN KEY ("user") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: expenses expenses_organization_organizations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_organization_organizations_id_fk FOREIGN KEY (organization) REFERENCES public.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: invoices invoices_client_clients_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_client_clients_id_fk FOREIGN KEY (client) REFERENCES public.clients(id) ON UPDATE CASCADE;


--
-- Name: invoices_item invoices_item_invoice_invoices_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices_item
    ADD CONSTRAINT invoices_item_invoice_invoices_id_fk FOREIGN KEY (invoice) REFERENCES public.invoices(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: invoices_item invoices_item_organization_organizations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices_item
    ADD CONSTRAINT invoices_item_organization_organizations_id_fk FOREIGN KEY (organization) REFERENCES public.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: invoices_item invoices_item_patient_patients_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices_item
    ADD CONSTRAINT invoices_item_patient_patients_id_fk FOREIGN KEY (patient) REFERENCES public.patients(id) ON UPDATE CASCADE;


--
-- Name: invoices_item invoices_item_visit_service_visits_service_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices_item
    ADD CONSTRAINT invoices_item_visit_service_visits_service_id_fk FOREIGN KEY (visit_service) REFERENCES public.visits_service(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: invoices invoices_organization_organizations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_organization_organizations_id_fk FOREIGN KEY (organization) REFERENCES public.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: oauth_codes oauth_codes_user_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.oauth_codes
    ADD CONSTRAINT oauth_codes_user_users_id_fk FOREIGN KEY ("user") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: owners owners_organization_organizations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.owners
    ADD CONSTRAINT owners_organization_organizations_id_fk FOREIGN KEY (organization) REFERENCES public.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: owners owners_user_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.owners
    ADD CONSTRAINT owners_user_users_id_fk FOREIGN KEY ("user") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: patients patients_client_clients_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_client_clients_id_fk FOREIGN KEY (client) REFERENCES public.clients(id) ON UPDATE CASCADE;


--
-- Name: patients_medical_record patients_medical_record_organization_organizations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patients_medical_record
    ADD CONSTRAINT patients_medical_record_organization_organizations_id_fk FOREIGN KEY (organization) REFERENCES public.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: patients_medical_record patients_medical_record_patient_patients_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patients_medical_record
    ADD CONSTRAINT patients_medical_record_patient_patients_id_fk FOREIGN KEY (patient) REFERENCES public.patients(id) ON UPDATE CASCADE;


--
-- Name: patients patients_organization_organizations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_organization_organizations_id_fk FOREIGN KEY (organization) REFERENCES public.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: patients_vaccination patients_vaccination_organization_organizations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patients_vaccination
    ADD CONSTRAINT patients_vaccination_organization_organizations_id_fk FOREIGN KEY (organization) REFERENCES public.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: patients_vaccination patients_vaccination_patient_patients_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patients_vaccination
    ADD CONSTRAINT patients_vaccination_patient_patients_id_fk FOREIGN KEY (patient) REFERENCES public.patients(id) ON UPDATE CASCADE;


--
-- Name: permissions permissions_user_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_user_users_id_fk FOREIGN KEY ("user") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: portals_answer portals_answer_field_portals_field_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portals_answer
    ADD CONSTRAINT portals_answer_field_portals_field_id_fk FOREIGN KEY (field) REFERENCES public.portals_field(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: portals_answer portals_answer_option_portals_field_option_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portals_answer
    ADD CONSTRAINT portals_answer_option_portals_field_option_id_fk FOREIGN KEY (option) REFERENCES public.portals_field_option(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: portals_answer portals_answer_organization_organizations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portals_answer
    ADD CONSTRAINT portals_answer_organization_organizations_id_fk FOREIGN KEY (organization) REFERENCES public.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: portals_answer portals_answer_submission_portals_submission_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portals_answer
    ADD CONSTRAINT portals_answer_submission_portals_submission_id_fk FOREIGN KEY (submission) REFERENCES public.portals_submission(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: portals portals_default_vet_employees_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portals
    ADD CONSTRAINT portals_default_vet_employees_id_fk FOREIGN KEY (default_vet) REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: portals_field_option portals_field_option_field_portals_field_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portals_field_option
    ADD CONSTRAINT portals_field_option_field_portals_field_id_fk FOREIGN KEY (field) REFERENCES public.portals_field(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: portals_field_option portals_field_option_organization_organizations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portals_field_option
    ADD CONSTRAINT portals_field_option_organization_organizations_id_fk FOREIGN KEY (organization) REFERENCES public.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: portals_field portals_field_organization_organizations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portals_field
    ADD CONSTRAINT portals_field_organization_organizations_id_fk FOREIGN KEY (organization) REFERENCES public.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: portals_field portals_field_portal_portals_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portals_field
    ADD CONSTRAINT portals_field_portal_portals_id_fk FOREIGN KEY (portal) REFERENCES public.portals(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: portals_field portals_field_stage_portals_stage_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portals_field
    ADD CONSTRAINT portals_field_stage_portals_stage_id_fk FOREIGN KEY (stage) REFERENCES public.portals_stage(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: portals portals_organization_organizations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portals
    ADD CONSTRAINT portals_organization_organizations_id_fk FOREIGN KEY (organization) REFERENCES public.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: portals_stage portals_stage_organization_organizations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portals_stage
    ADD CONSTRAINT portals_stage_organization_organizations_id_fk FOREIGN KEY (organization) REFERENCES public.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: portals_stage portals_stage_portal_portals_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portals_stage
    ADD CONSTRAINT portals_stage_portal_portals_id_fk FOREIGN KEY (portal) REFERENCES public.portals(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: portals_submission portals_submission_appointment_appointments_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portals_submission
    ADD CONSTRAINT portals_submission_appointment_appointments_id_fk FOREIGN KEY (appointment) REFERENCES public.appointments(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: portals_submission portals_submission_client_clients_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portals_submission
    ADD CONSTRAINT portals_submission_client_clients_id_fk FOREIGN KEY (client) REFERENCES public.clients(id) ON UPDATE CASCADE;


--
-- Name: portals_submission portals_submission_organization_organizations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portals_submission
    ADD CONSTRAINT portals_submission_organization_organizations_id_fk FOREIGN KEY (organization) REFERENCES public.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: portals_submission portals_submission_patient_patients_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portals_submission
    ADD CONSTRAINT portals_submission_patient_patients_id_fk FOREIGN KEY (patient) REFERENCES public.patients(id) ON UPDATE CASCADE;


--
-- Name: portals_submission portals_submission_portal_portals_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portals_submission
    ADD CONSTRAINT portals_submission_portal_portals_id_fk FOREIGN KEY (portal) REFERENCES public.portals(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: products products_organization_organizations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_organization_organizations_id_fk FOREIGN KEY (organization) REFERENCES public.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: services services_organization_organizations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_organization_organizations_id_fk FOREIGN KEY (organization) REFERENCES public.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sessions sessions_user_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_user_users_id_fk FOREIGN KEY ("user") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: superadmins superadmins_organization_organizations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.superadmins
    ADD CONSTRAINT superadmins_organization_organizations_id_fk FOREIGN KEY (organization) REFERENCES public.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: superadmins superadmins_user_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.superadmins
    ADD CONSTRAINT superadmins_user_users_id_fk FOREIGN KEY ("user") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: users users_organization_organizations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_organization_organizations_id_fk FOREIGN KEY (organization) REFERENCES public.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: visits visits_client_clients_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.visits
    ADD CONSTRAINT visits_client_clients_id_fk FOREIGN KEY (client) REFERENCES public.clients(id) ON UPDATE CASCADE;


--
-- Name: visits visits_invoice_invoices_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.visits
    ADD CONSTRAINT visits_invoice_invoices_id_fk FOREIGN KEY (invoice) REFERENCES public.invoices(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: visits visits_organization_organizations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.visits
    ADD CONSTRAINT visits_organization_organizations_id_fk FOREIGN KEY (organization) REFERENCES public.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: visits_service_grooming visits_service_grooming_groomer_employees_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.visits_service_grooming
    ADD CONSTRAINT visits_service_grooming_groomer_employees_id_fk FOREIGN KEY (groomer) REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: visits_service_grooming visits_service_grooming_organization_organizations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.visits_service_grooming
    ADD CONSTRAINT visits_service_grooming_organization_organizations_id_fk FOREIGN KEY (organization) REFERENCES public.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: visits_service_grooming visits_service_grooming_visit_service_visits_service_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.visits_service_grooming
    ADD CONSTRAINT visits_service_grooming_visit_service_visits_service_id_fk FOREIGN KEY (visit_service) REFERENCES public.visits_service(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: visits_service_lab visits_service_lab_organization_organizations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.visits_service_lab
    ADD CONSTRAINT visits_service_lab_organization_organizations_id_fk FOREIGN KEY (organization) REFERENCES public.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: visits_service_lab visits_service_lab_visit_service_visits_service_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.visits_service_lab
    ADD CONSTRAINT visits_service_lab_visit_service_visits_service_id_fk FOREIGN KEY (visit_service) REFERENCES public.visits_service(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: visits_service visits_service_organization_organizations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.visits_service
    ADD CONSTRAINT visits_service_organization_organizations_id_fk FOREIGN KEY (organization) REFERENCES public.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: visits_service visits_service_patient_patients_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.visits_service
    ADD CONSTRAINT visits_service_patient_patients_id_fk FOREIGN KEY (patient) REFERENCES public.patients(id) ON UPDATE CASCADE;


--
-- Name: visits_service_product visits_service_product_consultation_consultations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.visits_service_product
    ADD CONSTRAINT visits_service_product_consultation_consultations_id_fk FOREIGN KEY (consultation) REFERENCES public.consultations(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: visits_service_product visits_service_product_organization_organizations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.visits_service_product
    ADD CONSTRAINT visits_service_product_organization_organizations_id_fk FOREIGN KEY (organization) REFERENCES public.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: visits_service_product visits_service_product_product_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.visits_service_product
    ADD CONSTRAINT visits_service_product_product_products_id_fk FOREIGN KEY (product) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: visits_service_product visits_service_product_visit_service_visits_service_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.visits_service_product
    ADD CONSTRAINT visits_service_product_visit_service_visits_service_id_fk FOREIGN KEY (visit_service) REFERENCES public.visits_service(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: visits_service visits_service_service_services_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.visits_service
    ADD CONSTRAINT visits_service_service_services_id_fk FOREIGN KEY (service) REFERENCES public.services(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: visits_service visits_service_visit_visits_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.visits_service
    ADD CONSTRAINT visits_service_visit_visits_id_fk FOREIGN KEY (visit) REFERENCES public.visits(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict PR8fp6MSQ5fWK6HgHOaG0oLEpVcNK1fC2EOQ6hfjsV1tANodAqO91PTtH7ENlqU

