/*
SQLyog Community v13.2.1 (64 bit)
MySQL - 10.4.32-MariaDB : Database - ainnovice
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`ainnovice` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;

USE `ainnovice`;

/*Table structure for table `accounts` */

DROP TABLE IF EXISTS `accounts`;

CREATE TABLE `accounts` (
  `account_id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(60) NOT NULL,
  `password` varchar(60) NOT NULL,
  `fname` varchar(60) NOT NULL,
  `lname` varchar(60) NOT NULL,
  `age` int(11) NOT NULL,
  `gender` enum('M','F') NOT NULL,
  `employed` tinyint(1) NOT NULL,
  `job_description` varchar(120) NOT NULL,
  `contact_number` varchar(120) NOT NULL,
  `type` enum('patients','doctors','assistant') NOT NULL,
  `create_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`account_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `accounts` */

insert  into `accounts`(`account_id`,`email`,`password`,`fname`,`lname`,`age`,`gender`,`employed`,`job_description`,`contact_number`,`type`,`create_at`,`updated_at`) values 
(6,'jsubia@yondu.com','@Test1234.','Jieric','Subia',40,'M',1,'Racer','0912345678','patients','2024-10-23 15:06:42','2024-10-23 15:06:45'),
(7,'jramos@yondu.com','@Test123','Joshua','Ramos',30,'M',1,'Software Engineer','09153570574','patients','2024-10-23 15:07:18','2024-10-23 15:07:08');

/*Table structure for table `appointments` */

DROP TABLE IF EXISTS `appointments`;

CREATE TABLE `appointments` (
  `appointment_id` int(11) NOT NULL AUTO_INCREMENT,
  `account_id` int(11) NOT NULL,
  `doctor_id` int(11) NOT NULL,
  `alcohol_consumption` enum('None','Light','Moderate','Heavy') DEFAULT NULL,
  `smoking` tinyint(1) DEFAULT NULL,
  `height` int(11) DEFAULT NULL,
  `weight` int(11) DEFAULT NULL,
  `breathing_trouble` tinyint(1) DEFAULT NULL,
  `pain_level` int(11) DEFAULT NULL,
  `pain_part` varchar(60) DEFAULT NULL,
  `medical_concern` varchar(60) DEFAULT NULL,
  `symptoms` varchar(60) DEFAULT NULL,
  `temperature` float DEFAULT NULL,
  `appointment_date` date DEFAULT NULL,
  `appointment_start` varchar(60) DEFAULT NULL,
  `appointment_end` varchar(60) DEFAULT NULL,
  `urgency` float DEFAULT NULL,
  `status` enum('Completed','Ongoing','Waiting','Cancelled') DEFAULT NULL,
  PRIMARY KEY (`appointment_id`),
  KEY `appointments_ibfk_1` (`doctor_id`),
  KEY `appointments_ibfk_2` (`account_id`),
  CONSTRAINT `appointments_ibfk_1` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`doctor_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `appointments_ibfk_2` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`account_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `appointments` */

insert  into `appointments`(`appointment_id`,`account_id`,`doctor_id`,`alcohol_consumption`,`smoking`,`height`,`weight`,`breathing_trouble`,`pain_level`,`pain_part`,`medical_concern`,`symptoms`,`temperature`,`appointment_date`,`appointment_start`,`appointment_end`,`urgency`,`status`) values 
(24,6,7,'Moderate',1,166,55,1,7,'Head','Heart Attack','Stomach Ache',36.4,'2024-10-23','15:30','16:00',7,'Waiting'),
(25,6,8,'Light',1,155,54,1,3,'Stomach','Ulcer','Stomach Ache',35.5,'2024-10-23','13:30','14:30',4,'Completed'),
(27,6,16,'Light',0,155,54,1,2,'Eye','Cataracts','Eye',34,'2024-10-29','16:00','17:00',3,'Ongoing'),
(28,6,31,NULL,1,155,54,1,3,'Ear','Nani','Heheh',13,'2024-10-24','11:00','12:00',4,'Cancelled');

/*Table structure for table `doctor_operating_hours` */

DROP TABLE IF EXISTS `doctor_operating_hours`;

CREATE TABLE `doctor_operating_hours` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `doctor_id` int(11) NOT NULL,
  `day` date NOT NULL,
  `hours_start` varchar(120) NOT NULL,
  `hours_end` varchar(120) NOT NULL,
  `limit` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `doctor_operating_hours` */

insert  into `doctor_operating_hours`(`id`,`doctor_id`,`day`,`hours_start`,`hours_end`,`limit`) values 
(2,1,'2024-10-23','8','15',10),
(3,2,'2024-10-23','8','17',NULL),
(4,1,'2024-10-24','10','18',NULL),
(6,2,'2024-10-24','9','24',NULL);

/*Table structure for table `doctors` */

DROP TABLE IF EXISTS `doctors`;

CREATE TABLE `doctors` (
  `doctor_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(120) NOT NULL,
  `specialty` varchar(120) NOT NULL,
  PRIMARY KEY (`doctor_id`)
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `doctors` */

insert  into `doctors`(`doctor_id`,`name`,`specialty`) values 
(7,'Dr. John Smith','Cardiology'),
(8,'Dr. Sarah Johnson','Neurology'),
(9,'Dr. Emily Brown','Pediatrics'),
(10,'Dr. Michael Davis','Orthopedics'),
(11,'Dr. Laura Wilson','Dermatology'),
(12,'Dr. Robert Martinez','Gastroenterology'),
(13,'Dr. Patricia Lee','Oncology'),
(14,'Dr. William Anderson','Psychiatry'),
(15,'Dr. Linda Taylor','Endocrinology'),
(16,'Dr. James Harris','Ophthalmology'),
(17,'Dr. Karen Clark','Rheumatology'),
(18,'Dr. Steven Lewis','Pulmonology'),
(19,'Dr. Maria Robinson','Nephrology'),
(20,'Dr. David Walker','Urology'),
(21,'Dr. Jessica Hall','Emergency Medicine'),
(22,'Dr. Richard Young','General Surgery'),
(23,'Dr. Thomas King','Radiology'),
(24,'Dr. Alice Johnson','Cardiology'),
(25,'Dr. Brian Smith','Neurology'),
(26,'Dr. Clara Davis','Pediatrics'),
(27,'Dr. David Wilson','Dermatology'),
(28,'Dr. Emma Brown','Orthopedics'),
(29,'Dr. Frank Miller','General Surgery'),
(30,'Dr. Grace Taylor','Psychiatry'),
(31,'Dr. Henry Anderson','Radiology'),
(32,'Dr. Irene Thomas','Gastroenterology'),
(33,'Dr. Jack Jackson','Endocrinology'),
(34,'Dr. Karen White','Obstetrics'),
(35,'Dr. Liam Harris','Oncology'),
(36,'Dr. Mia Martin','Urology'),
(37,'Dr. Noah Thompson','Ophthalmology'),
(38,'Dr. Olivia Garcia','Emergency Medicine'),
(39,'Dr. Paul Martinez','Anesthesiology'),
(40,'Dr. Queen Lee','Hematology'),
(41,'Dr. Ryan Young','Neurosurgery'),
(42,'Dr. Sarah Allen','Infectious Diseases'),
(43,'Dr. Thomas King','Pulmonology');

/*Table structure for table `medical_rooms` */

DROP TABLE IF EXISTS `medical_rooms`;

CREATE TABLE `medical_rooms` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `room_name` varchar(255) DEFAULT NULL,
  `machines` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `medical_rooms` */

insert  into `medical_rooms`(`id`,`room_name`,`machines`) values 
(1,'Radiology Room','[\"X-ray Machine\", \"CT Scanner\", \"MRI Machine\", \"Fluoroscopy Machine\"]'),
(2,'Operating Room','[\"Anesthesia Machine\", \"Surgical Robot\", \"Electrosurgical Unit\", \"Patient Monitor\"]'),
(3,'Emergency Room','[\"Defibrillator\", \"Ventilator\", \"ECG Machine\", \"Infusion Pump\"]'),
(4,'Intensive Care Unit (ICU)','[\"Ventilator\", \"Patient Monitor\", \"Cardiac Monitor\", \"Continuous Renal Replacement Therapy (CRRT) Machine\"]'),
(5,'Laboratory Room','[\"Blood Analyzer\", \"Centrifuge\", \"PCR Machine\", \"Incubator\"]'),
(6,'Maternity Room','[\"Fetal Monitor\", \"Ultrasound Machine\", \"Infant Warmer\", \"Delivery Bed\"]'),
(7,'Dental Room','[\"Dental X-ray Machine\", \"Dental Chair\", \"Autoclave\", \"Intraoral Camera\"]'),
(8,'Dialysis Room','[\"Dialysis Machine\", \"Blood Pressure Monitor\", \"Ultrafiltration Machine\", \"Weighing Scale\"]'),
(9,'Physiotherapy Room','[\"Ultrasound Therapy Machine\", \"Electrical Stimulation Machine\", \"Therapeutic Laser\", \"Treadmill\"]'),
(10,'Cardiology Room','[\"ECG Machine\", \"Echocardiogram Machine\", \"Stress Test Machine\", \"Holter Monitor\"]');

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
