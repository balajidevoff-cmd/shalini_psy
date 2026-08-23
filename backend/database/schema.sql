
/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
DROP TABLE IF EXISTS `ai_analyses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ai_analyses` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `session_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `model_name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `model_version` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `prompt_version` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `summary` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `risk_observation` text COLLATE utf8mb4_unicode_ci,
  `raw_response_json` longtext COLLATE utf8mb4_unicode_ci,
  `generated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'AWAITING_REVIEW',
  PRIMARY KEY (`id`),
  UNIQUE KEY `ai_analyses_session_id_key` (`session_id`),
  CONSTRAINT `ai_analyses_session_id_fkey` FOREIGN KEY (`session_id`) REFERENCES `assessment_sessions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `ai_suggestions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ai_suggestions` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ai_analysis_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `suggestion_type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `confidence_level` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT 'MODERATE',
  `input_references_json` text COLLATE utf8mb4_unicode_ci,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `decision_comment` text COLLATE utf8mb4_unicode_ci,
  `modified_content` text COLLATE utf8mb4_unicode_ci,
  `decided_at` datetime(3) DEFAULT NULL,
  `order_index` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `ai_suggestions_ai_analysis_id_fkey` (`ai_analysis_id`),
  CONSTRAINT `ai_suggestions_ai_analysis_id_fkey` FOREIGN KEY (`ai_analysis_id`) REFERENCES `ai_analyses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `assessment_assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assessment_assignments` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `patient_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `assessment_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `assigned_by_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `assigned_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `due_date` datetime(3) DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  PRIMARY KEY (`id`),
  KEY `assessment_assignments_patient_id_fkey` (`patient_id`),
  KEY `assessment_assignments_assessment_id_fkey` (`assessment_id`),
  KEY `assessment_assignments_assigned_by_id_fkey` (`assigned_by_id`),
  CONSTRAINT `assessment_assignments_assessment_id_fkey` FOREIGN KEY (`assessment_id`) REFERENCES `assessments` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `assessment_assignments_assigned_by_id_fkey` FOREIGN KEY (`assigned_by_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `assessment_assignments_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `assessment_domains`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assessment_domains` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `order_index` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `assessment_domains_name_key` (`name`),
  UNIQUE KEY `assessment_domains_code_key` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `assessment_options`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assessment_options` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `question_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `label` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` int NOT NULL,
  `order_index` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `assessment_options_question_id_fkey` (`question_id`),
  CONSTRAINT `assessment_options_question_id_fkey` FOREIGN KEY (`question_id`) REFERENCES `assessment_questions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `assessment_questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assessment_questions` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `assessment_version_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `question_number` int NOT NULL,
  `question_text` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `question_type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SINGLE_CHOICE',
  `subscale` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `required` tinyint(1) NOT NULL DEFAULT '1',
  `is_reverse_scored` tinyint(1) NOT NULL DEFAULT '0',
  `risk_trigger_value` int DEFAULT NULL,
  `order_index` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `assessment_questions_assessment_version_id_fkey` (`assessment_version_id`),
  CONSTRAINT `assessment_questions_assessment_version_id_fkey` FOREIGN KEY (`assessment_version_id`) REFERENCES `assessment_versions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `assessment_responses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assessment_responses` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `session_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `question_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `response_value` int NOT NULL,
  `response_text` text COLLATE utf8mb4_unicode_ci,
  `answered_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `assessment_responses_session_id_question_id_key` (`session_id`,`question_id`),
  KEY `assessment_responses_question_id_fkey` (`question_id`),
  CONSTRAINT `assessment_responses_question_id_fkey` FOREIGN KEY (`question_id`) REFERENCES `assessment_questions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `assessment_responses_session_id_fkey` FOREIGN KEY (`session_id`) REFERENCES `assessment_sessions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `assessment_scores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assessment_scores` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `session_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `raw_score` int NOT NULL,
  `max_possible_score` int NOT NULL,
  `standard_score` double DEFAULT NULL,
  `percentile` double DEFAULT NULL,
  `severity` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `severity_color` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '#F59E0B',
  `has_risk_flag` tinyint(1) NOT NULL DEFAULT '0',
  `risk_flag_details` text COLLATE utf8mb4_unicode_ci,
  `interpretation` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `scored_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `assessment_scores_session_id_key` (`session_id`),
  CONSTRAINT `assessment_scores_session_id_fkey` FOREIGN KEY (`session_id`) REFERENCES `assessment_sessions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `assessment_scoring_rules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assessment_scoring_rules` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `assessment_version_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subscale_name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `scoring_method` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SUM',
  `min_score` int NOT NULL DEFAULT '0',
  `max_score` int NOT NULL,
  `cutoff_score` int DEFAULT NULL,
  `rule_json` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `assessment_scoring_rules_assessment_version_id_fkey` (`assessment_version_id`),
  CONSTRAINT `assessment_scoring_rules_assessment_version_id_fkey` FOREIGN KEY (`assessment_version_id`) REFERENCES `assessment_versions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `assessment_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assessment_sessions` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `patient_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `assessment_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `assessment_version_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `assignment_id` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `conducted_by_id` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DRAFT',
  `current_question_index` int NOT NULL DEFAULT '0',
  `started_at` datetime(3) DEFAULT NULL,
  `completed_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `assessment_sessions_patient_id_fkey` (`patient_id`),
  KEY `assessment_sessions_assessment_id_fkey` (`assessment_id`),
  KEY `assessment_sessions_assessment_version_id_fkey` (`assessment_version_id`),
  KEY `assessment_sessions_assignment_id_fkey` (`assignment_id`),
  KEY `assessment_sessions_conducted_by_id_fkey` (`conducted_by_id`),
  CONSTRAINT `assessment_sessions_assessment_id_fkey` FOREIGN KEY (`assessment_id`) REFERENCES `assessments` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `assessment_sessions_assessment_version_id_fkey` FOREIGN KEY (`assessment_version_id`) REFERENCES `assessment_versions` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `assessment_sessions_assignment_id_fkey` FOREIGN KEY (`assignment_id`) REFERENCES `assessment_assignments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `assessment_sessions_conducted_by_id_fkey` FOREIGN KEY (`conducted_by_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `assessment_sessions_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `assessment_severity_bands`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assessment_severity_bands` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `assessment_version_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subscale_name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `min_score` int NOT NULL,
  `max_score` int NOT NULL,
  `severity_label` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `color_hex` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '#10B981',
  `clinical_description` text COLLATE utf8mb4_unicode_ci,
  `order_index` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `assessment_severity_bands_assessment_version_id_fkey` (`assessment_version_id`),
  CONSTRAINT `assessment_severity_bands_assessment_version_id_fkey` FOREIGN KEY (`assessment_version_id`) REFERENCES `assessment_versions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `assessment_subscale_scores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assessment_subscale_scores` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `score_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subscale_name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `raw_score` int NOT NULL,
  `max_score` int NOT NULL,
  `severity` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `color_hex` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '#3B82F6',
  PRIMARY KEY (`id`),
  KEY `assessment_subscale_scores_score_id_fkey` (`score_id`),
  CONSTRAINT `assessment_subscale_scores_score_id_fkey` FOREIGN KEY (`score_id`) REFERENCES `assessment_scores` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `assessment_versions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assessment_versions` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `assessment_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `version` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '1.0',
  `instructions` text COLLATE utf8mb4_unicode_ci,
  `is_current` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `assessment_versions_assessment_id_version_key` (`assessment_id`,`version`),
  CONSTRAINT `assessment_versions_assessment_id_fkey` FOREIGN KEY (`assessment_id`) REFERENCES `assessments` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `assessments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assessments` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `domain_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `short_name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `age_min` int NOT NULL DEFAULT '12',
  `age_max` int NOT NULL DEFAULT '100',
  `administration_type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SELF_REPORT',
  `licensing_status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'OPEN_ACCESS_DEMO',
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_by_id` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `assessments_domain_id_fkey` (`domain_id`),
  KEY `assessments_created_by_id_fkey` (`created_by_id`),
  CONSTRAINT `assessments_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `assessments_domain_id_fkey` FOREIGN KEY (`domain_id`) REFERENCES `assessment_domains` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_email` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `action` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_id` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ip_address` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `metadata` text COLLATE utf8mb4_unicode_ci,
  `timestamp` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `audit_logs_user_id_fkey` (`user_id`),
  CONSTRAINT `audit_logs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `clinical_reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clinical_reviews` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `session_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `psychologist_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `psychologist_name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `clinical_interview` text COLLATE utf8mb4_unicode_ci,
  `clinical_observations` text COLLATE utf8mb4_unicode_ci,
  `areas_of_concern` text COLLATE utf8mb4_unicode_ci,
  `risk_level` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'LOW',
  `risk_justification` text COLLATE utf8mb4_unicode_ci,
  `recommendations` text COLLATE utf8mb4_unicode_ci,
  `further_assessments` text COLLATE utf8mb4_unicode_ci,
  `referral_plan` text COLLATE utf8mb4_unicode_ci,
  `follow_up_plan_notes` text COLLATE utf8mb4_unicode_ci,
  `final_clinical_impression` text COLLATE utf8mb4_unicode_ci,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DRAFT',
  `reviewed_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `clinical_reviews_session_id_key` (`session_id`),
  KEY `clinical_reviews_psychologist_id_fkey` (`psychologist_id`),
  CONSTRAINT `clinical_reviews_psychologist_id_fkey` FOREIGN KEY (`psychologist_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `clinical_reviews_session_id_fkey` FOREIGN KEY (`session_id`) REFERENCES `assessment_sessions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `consent_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `consent_records` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `patient_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `consent_type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PSYCHOLOGICAL_SCREENING',
  `version` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '1.0',
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'GIVEN',
  `accepted_by` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ip_address` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `consent_text` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `granted_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `revoked_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `consent_records_patient_id_fkey` (`patient_id`),
  CONSTRAINT `consent_records_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `follow_up_plans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `follow_up_plans` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `patient_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `assigned_clinician_id` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `scheduled_date` datetime(3) NOT NULL,
  `follow_up_type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ROUTINE_SCREENING_REVIEW',
  `purpose` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SCHEDULED',
  `reminder_sent` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `follow_up_plans_patient_id_fkey` (`patient_id`),
  KEY `follow_up_plans_assigned_clinician_id_fkey` (`assigned_clinician_id`),
  CONSTRAINT `follow_up_plans_assigned_clinician_id_fkey` FOREIGN KEY (`assigned_clinician_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `follow_up_plans_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'INFO',
  `link_url` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `notifications_user_id_fkey` (`user_id`),
  CONSTRAINT `notifications_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `patient_contacts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patient_contacts` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `patient_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `state` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `postal_code` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `emergency_name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `emergency_relation` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `emergency_phone` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `patient_contacts_patient_id_key` (`patient_id`),
  CONSTRAINT `patient_contacts_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `patient_histories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patient_histories` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `patient_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `presenting_complaints` text COLLATE utf8mb4_unicode_ci,
  `symptom_duration` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `medical_history` text COLLATE utf8mb4_unicode_ci,
  `family_history` text COLLATE utf8mb4_unicode_ci,
  `trauma_history` text COLLATE utf8mb4_unicode_ci,
  `major_life_events` text COLLATE utf8mb4_unicode_ci,
  `suicidal_thoughts` tinyint(1) NOT NULL DEFAULT '0',
  `self_harm_history` tinyint(1) NOT NULL DEFAULT '0',
  `substance_use` text COLLATE utf8mb4_unicode_ci,
  `sleep_pattern` text COLLATE utf8mb4_unicode_ci,
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `patient_histories_patient_id_key` (`patient_id`),
  CONSTRAINT `patient_histories_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `patients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patients` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `patient_code` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `first_name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date_of_birth` datetime(3) NOT NULL,
  `age` int NOT NULL,
  `gender` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'FEMALE',
  `education` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `occupation` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `marital_status` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `socioeconomic_status` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `assigned_psychologist_id` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `patients_patient_code_key` (`patient_code`),
  KEY `patients_assigned_psychologist_id_fkey` (`assigned_psychologist_id`),
  CONSTRAINT `patients_assigned_psychologist_id_fkey` FOREIGN KEY (`assigned_psychologist_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reports` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `patient_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `session_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `report_number` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'AI-Assisted Psychological Screening Report',
  `version` int NOT NULL DEFAULT '1',
  `reviewed_by_name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reviewed_by_role` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Psychologist',
  `pdf_path` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `summary_json` longtext COLLATE utf8mb4_unicode_ci,
  `generated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `reports_report_number_key` (`report_number`),
  KEY `reports_patient_id_fkey` (`patient_id`),
  KEY `reports_session_id_fkey` (`session_id`),
  CONSTRAINT `reports_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `reports_session_id_fkey` FOREIGN KEY (`session_id`) REFERENCES `assessment_sessions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `system_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_settings` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `key` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `system_settings_key_key` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `first_name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PSYCHOLOGIST',
  `title` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `license_number` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `last_login_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

