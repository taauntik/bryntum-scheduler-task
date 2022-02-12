SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

DROP TABLE IF EXISTS `options`;
DROP TABLE IF EXISTS `events`;
DROP TABLE IF EXISTS `resources`;


CREATE TABLE IF NOT EXISTS `resources` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Name` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=1;

INSERT INTO `resources` (`Name`) VALUES
('Tom'),
('Mike'),
('Jerry'),
('Larry'),
('Tina'),
('Tony');


CREATE TABLE IF NOT EXISTS `events` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Name` varchar(255) DEFAULT NULL,
  `StartDate` datetime DEFAULT NULL,
  `EndDate` datetime DEFAULT NULL,
  `ResourceId` int(11) DEFAULT NULL,
  `Resizable` tinyint(1) DEFAULT 1,
  `Draggable` tinyint(1) DEFAULT 1,
  `Cls` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  INDEX (`ResourceId`),
  CONSTRAINT `fk_events_resources` FOREIGN KEY (`ResourceId`) REFERENCES `resources`(`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=1;

INSERT INTO `events` (`Name`, `StartDate`, `EndDate`, `ResourceId`, `Resizable`, `Draggable`, `Cls`) VALUES
('Consulting for Oracle', '2017-09-15 17:00:00', '2017-09-18 00:00:00', 1, 1, 1, ''),
('Consulting for IBM', '2017-09-13 10:00:00', '2017-09-15 00:00:00', 2, 1, 1, ''),
('Recruit new manager', '2017-09-11 12:00:00', '2017-09-14 00:00:00', 3, 1, 1, ''),
('Paperwork', '2017-09-16 22:00:00', '2017-09-19 00:00:00', 2, 1, 1, ''),
('Holidays', '2017-09-10 01:00:00', '2017-09-16 23:00:00', 1, 1, 1, ''),
('Work on the new technology', '2017-09-14 09:00:00', '2017-09-20 17:00:00', 4, 1, 1, ''),
('Secret task', '2017-09-14 06:00:00', '2017-09-14 16:00:00', 5, 1, 1, ''),
('Prepare the list', '2017-09-17 10:00:00', '2017-09-19 00:00:00', 5, 1, 1, '');


CREATE TABLE IF NOT EXISTS `options` (
  `name` varchar(45) NOT NULL,
  `value` varchar(45) DEFAULT NULL,
  `dt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

INSERT INTO `options` (`name`, `value`) VALUES
('revision', '1');

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
