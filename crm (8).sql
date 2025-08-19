-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 06, 2025 at 04:27 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `crm`
--

-- --------------------------------------------------------

--
-- Table structure for table `staff`
--

CREATE TABLE `staff` (
  `userId` int(11) NOT NULL,
  `userLogin` text DEFAULT NULL,
  `userPassword` text DEFAULT NULL,
  `userName` text DEFAULT NULL,
  `userPhone` varchar(11) DEFAULT NULL,
  `userEmail` text DEFAULT NULL,
  `userPost` text DEFAULT NULL,
  `userRole` text NOT NULL DEFAULT 'user',
  `userNotificationCount` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `staff`
--

INSERT INTO `staff` (`userId`, `userLogin`, `userPassword`, `userName`, `userPhone`, `userEmail`, `userPost`, `userRole`, `userNotificationCount`) VALUES
(2, 'admin', '$2b$10$bYtypPQOvaSrta9OjRCqQuWDyWq/WZXaOG6lmASGIG3hDid9vnutu', 'Иванов Иван Иванович', '89999999999', 'example@example.ru', 'Директор', 'admin', 0),
(3, 'dmitievich', '$2b$10$GAgtffH9NlXUO8W090.x2OTpJ7TGIqlfe7yzl03pJTv5RPXlq8xN2', 'Дмитриев Дмитрий Дмитриевич', '78888888888', 'dmitievich@example.ru', 'Аналитик', 'user', 0),
(4, 'alexeevich', '$2b$10$/.Rdymxc5z5d95c0/TJSzeKOd.Fe9Az4gvYVGuZsI27YnAg2bUgm2', 'Алексеев Алексей Алексеевич', '76666666666', 'alexeevich@example.ru', 'Дизайнер', 'user', 0),
(5, 'alexandr', '$2b$10$TLaFXWo1TA9r5qL9SgTQZO5zV1m5o7ERw8WZpBbg9O//nohQneSri', 'Александров Александр Александрович', '75555555555', 'alexandr@example.ru', 'Курьер', 'user', 0);

-- --------------------------------------------------------

--
-- Table structure for table `taskparts`
--

CREATE TABLE `taskparts` (
  `taskPartId` int(11) NOT NULL,
  `taskId` int(11) NOT NULL,
  `taskPartDeadline` text NOT NULL,
  `taskPartName` text NOT NULL,
  `taskPartResult` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `taskparts`
--

INSERT INTO `taskparts` (`taskPartId`, `taskId`, `taskPartDeadline`, `taskPartName`, `taskPartResult`) VALUES
(1, 1, '2025-07-27 - 2025-07-28', 'Согласование с заказчиком', 'Согласовать ТЗ, с представителем заказчика и директором'),
(2, 1, '2025-07-29 - 2025-07-31', 'Разработка дизайн макета', 'Разработать дизайн макет. Утвердить его представителем заказчика и утвердить директором'),
(3, 1, '2025-07-31 - 2025-08-01', 'Печать баннера', 'Выполнить печать и резку баннера по размерам, а так-же провести проверку качества'),
(4, 1, '2025-08-02 - 2025-08-03', 'Доставить баннер до заказчика', 'Доставить баннер'),
(5, 2, '2025-07-30 - 2025-07-31', ' Исследование и анализ', 'Провести анализ рынка и целевой аудитории для нового мобильного приложения (тему выбирает команда, например: фитнес, финансы, образование и т. д.).\n\nОпределить ключевые тренды и конкурентов.\n\nСоставить портрет ЦА (возраст, интересы, боли).\n\nСформулировать гипотезы: какие функции будут востребованы?'),
(6, 2, '2025-07-31 - 2025-08-02', 'Проектирование интерфейса (Дизайнер)', 'На основе данных аналитика создать:\n\nUser Flow (схему взаимодействия пользователя с приложением).\n\nВайрфреймы (чёрно-белые макеты основных экранов).\n\nUI-концепцию (цвета, шрифты, стиль).\n\nРезультат: Макеты в Figma/Sketch + краткое обоснование решений.'),
(7, 2, '2025-08-03 - 2025-08-04', 'Валидация идеи (Аналитик + Дизайнер)', 'Задание:\n\nАналитик: подготовить опрос/интервью по концепции (удобство, нужность функций).\n\nДизайнер: доработать дизайн на основе фидбека.\n\nСовместно: предложить MVP-версию (минимальный функционал для запуска).'),
(8, 3, '2025-08-06 - 2025-08-08', 'Анализ проблем и поведения пользователей ', 'Собрать и проанализировать данные: метрики (где чаще всего «вылетают» пользователи?), отзывы, heatmaps.\n\nПровести опрос или интервью с клиентами, чтобы выявить ключевые боли.\n\nСформировать список основных проблем и предложить гипотезы для улучшения.\n\nРезультат: Документ с выводами и приоритетами для доработки интерфейса.'),
(9, 3, '2025-08-07 - 2025-08-08', 'Редизайн ключевых экранов (Дизайнер)', 'На основе выводов аналитика переработать 3 основных экрана (например: перевод денег, главный экран, история операций).\n\nУпростить навигацию, сделать действия более очевидными.\n\nПодготовить 2 варианта дизайна (A/B тестирование) для спорных решений.\n\nРезультат: Интерактивный прототип в Figma с комментариями по изменениям.'),
(10, 3, '2025-08-10 - 2025-08-12', ' Тестирование и итоговые рекомендации (Аналитик + Дизайнер)', 'Аналитик: организовать юзабилити-тестирование прототипа на фокус-группе.\n\nДизайнер: скорректировать макеты по фидбеку.\n\nСовместно: предложить roadmap внедрения изменений (что запустить сразу, что — во второй волне).\n\nРезультат: Финальная презентация с дизайном, данными тестов и планом действий.'),
(11, 4, '2025-08-19 - 2025-08-22', 'Исследование аудитории и рынка (Аналитик)', 'Провести конкурентный анализ существующих \"зеленых\" приложений.\n\nОпрос потенциальных пользователей: какие экопривычки их интересуют? Какие барьеры мешают?\n\nОпределить ключевые метрики успеха (например, частота использования, количество завершенных \"челленджей\").'),
(12, 4, '2025-08-24 - 2025-09-05', 'Проектирование пользовательского пути (Дизайнер)', 'Создать сценарии использования (user stories) на основе данных аналитика.\n\nРазработать:\n\nЛогику геймификации (бейджи, прогресс-бары).\n\nВизуальную метафору (например, \"дерево, которое растет\" при выполнении задач).\n\nПодготовить low-fi прототип основных экранов (трекер, статистика, мотивационные уведомления).'),
(13, 4, '2025-08-10 - 2025-09-10', 'Проверка гипотез и итерация (Аналитик + Дизайнер)', 'Аналитик:\n\nA/B-тест двух вариантов мотивационных механизмов (например, соревнование vs. персональные цели).\n\nЗамерить реакцию фокус-группы на прототип.\n\nДизайнер:\n\nДоработать интерфейс на основе фидбека (упростить/добавить элементы).\n\nПодготовить UI-кит для разработчиков.'),
(14, 4, '2025-09-11 - 2025-09-12', 'Старт проекта', 'Старт проекта');

-- --------------------------------------------------------

--
-- Table structure for table `taskreports`
--

CREATE TABLE `taskreports` (
  `taskReportId` int(11) NOT NULL,
  `reportTaskPart` int(11) NOT NULL,
  `reportTime` datetime NOT NULL DEFAULT current_timestamp(),
  `reportStatus` text NOT NULL DEFAULT 'В работе',
  `reportDescr` text DEFAULT NULL,
  `reportUserId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `taskreports`
--

INSERT INTO `taskreports` (`taskReportId`, `reportTaskPart`, `reportTime`, `reportStatus`, `reportDescr`, `reportUserId`) VALUES
(1, 5, '2025-08-06 12:07:38', 'В работе', 'Этап по задаче принят к исполнению', 3),
(2, 5, '2025-08-06 12:08:03', 'Выполнен', 'Проведен анализ рынка и целевой аудитории для нового мобильного приложения', 3),
(3, 6, '2025-08-06 12:08:29', 'В работе', 'Задача принята в работу', 3),
(4, 6, '2025-08-06 12:09:17', 'Выполнен', 'Аналитик Дмитрий, предоставил данные иследований, и по ним был проведенно проектирование интерфейса', 3),
(5, 7, '2025-08-06 12:11:37', 'Выполнен', '1. Общая информация\nПодготовлен опрос\nКак часто вы пользуетесь мобильными приложениями подобного типа?\nКакие аналогичные приложения вы уже используете?\nПеречислите, если есть\nЧто вам нравится/не нравится в текущих приложениях?\n2. Оценка функций\nКакой интерфейс вам удобнее?\nКак вы относитесь к платным функциям?', 3),
(6, 8, '2025-08-06 12:16:29', 'В работе', 'Принят в работу', 3),
(7, 8, '2025-08-06 12:16:43', 'Выполнен', 'Результат: Документ с выводами и приоритетами для доработки интерфейса.', 3),
(8, 9, '2025-08-06 12:20:55', 'Выполнен', 'Задача выполнена', 3),
(9, 10, '2025-08-06 12:21:11', 'Выполнен', 'Описание выполеннной работы', 3);

--
-- Triggers `taskreports`
--
DELIMITER $$
CREATE TRIGGER `update_task_status_after_insert` AFTER INSERT ON `taskreports` FOR EACH ROW BEGIN
    DECLARE task_id_val INT;
    DECLARE total_parts INT;
    DECLARE completed_parts INT;
    DECLARE in_progress_parts INT;
    DECLARE on_review_parts INT;
    DECLARE current_status VARCHAR(20);
    DECLARE deadline_end DATE;
    DECLARE is_closed_on_time BOOLEAN;
    
    -- Получаем ID задачи
    SELECT taskId INTO task_id_val 
    FROM taskparts 
    WHERE taskPartId = NEW.reportTaskPart;
    
    -- Получаем текущий статус задачи
    SELECT taskStatus INTO current_status
    FROM tasks
    WHERE taskId = task_id_val;
    
    -- Получаем конечную дату выполнения (последнюю дату из taskDeadlines)
    SELECT STR_TO_DATE(SUBSTRING_INDEX(taskDeadlines, ' - ', -1), '%Y-%m-%d') INTO deadline_end
    FROM tasks
    WHERE taskId = task_id_val;
    
    -- Считаем общее количество частей задачи
    SELECT COUNT(*) INTO total_parts 
    FROM taskparts 
    WHERE taskId = task_id_val;
    
    -- Считаем количество выполненных частей (только последний отчет для каждой части)
    SELECT COUNT(DISTINCT tp.taskPartId) INTO completed_parts
    FROM taskparts tp
    JOIN taskreports tr ON tp.taskPartId = tr.reportTaskPart
    WHERE tp.taskId = task_id_val 
    AND tr.reportStatus = 'Выполнен'
    AND tr.reportTime = (
        SELECT MAX(reportTime) 
        FROM taskreports 
        WHERE reportTaskPart = tp.taskPartId
    );
    
    -- Считаем частей в работе
    SELECT COUNT(DISTINCT tp.taskPartId) INTO in_progress_parts
    FROM taskparts tp
    JOIN taskreports tr ON tp.taskPartId = tr.reportTaskPart
    WHERE tp.taskId = task_id_val 
    AND tr.reportStatus = 'В работе'
    AND tr.reportTime = (
        SELECT MAX(reportTime) 
        FROM taskreports 
        WHERE reportTaskPart = tp.taskPartId
    );
    
    -- Считаем частей на утверждении
    SELECT COUNT(DISTINCT tp.taskPartId) INTO on_review_parts
    FROM taskparts tp
    JOIN taskreports tr ON tp.taskPartId = tr.reportTaskPart
    WHERE tp.taskId = task_id_val 
    AND tr.reportStatus = 'На утверждении'
    AND tr.reportTime = (
        SELECT MAX(reportTime) 
        FROM taskreports 
        WHERE reportTaskPart = tp.taskPartId
    );
    
    -- Обновляем статус задачи
    IF completed_parts = total_parts THEN
        -- Определяем, закрыта ли задача в срок
        IF NOW() <= deadline_end THEN
            SET is_closed_on_time = TRUE;
        ELSE
            SET is_closed_on_time = FALSE;
        END IF;
        
        -- Если статус меняется на success и ранее не был success
        IF current_status != 'success' THEN
            UPDATE tasks 
            SET taskStatus = 'success', 
                taskActualClose = NOW(), -- Записываем текущую дату и время
                closedOnTime = is_closed_on_time -- Устанавливаем флаг своевременного закрытия
            WHERE taskId = task_id_val;
        ELSE
            UPDATE tasks 
            SET taskStatus = 'success',
                closedOnTime = is_closed_on_time -- Обновляем флаг, если статус уже был success
            WHERE taskId = task_id_val;
        END IF;
    ELSEIF in_progress_parts > 0 OR on_review_parts > 0 THEN
        UPDATE tasks 
        SET taskStatus = 'inWork',
            taskActualClose = NULL, -- Сбрасываем дату завершения
            closedOnTime = NULL -- Сбрасываем флаг своевременного закрытия
        WHERE taskId = task_id_val;
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `taskreport_staff`
--

CREATE TABLE `taskreport_staff` (
  `taskReportId` int(11) DEFAULT NULL,
  `userId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `taskreport_staff`
--

INSERT INTO `taskreport_staff` (`taskReportId`, `userId`) VALUES
(1, 3),
(2, 3),
(3, 4),
(4, 4),
(4, 3),
(5, 3),
(5, 4),
(6, 3),
(7, 3),
(7, 2),
(8, 3),
(9, 3),
(9, 4),
(9, 2);

-- --------------------------------------------------------

--
-- Table structure for table `tasks`
--

CREATE TABLE `tasks` (
  `taskId` int(11) NOT NULL,
  `taskDescr` text DEFAULT NULL,
  `taskDeadlines` text DEFAULT NULL,
  `taskCustomerId` int(11) DEFAULT NULL,
  `taskDateCreate` datetime NOT NULL DEFAULT current_timestamp(),
  `taskGlobalResult` text DEFAULT NULL,
  `taskStatus` text DEFAULT 'created',
  `taskActualClose` datetime DEFAULT NULL,
  `closedOnTime` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tasks`
--

INSERT INTO `tasks` (`taskId`, `taskDescr`, `taskDeadlines`, `taskCustomerId`, `taskDateCreate`, `taskGlobalResult`, `taskStatus`, `taskActualClose`, `closedOnTime`) VALUES
(1, 'Создать рекламный баннер для компании \"CompanyName\"', '2025-07-27 - 2025-08-03', 2, '2025-08-05 15:44:16', 'Утвержден и создан рекламный баннер соответствующий стандартам качества', 'created', NULL, NULL),
(2, 'Разработка концепции нового мобильного приложения', '2025-07-30 - 2025-08-04', 2, '2025-08-05 15:47:33', 'Утвержден и создан рекламный баннер соответствующий стандартам качества', 'success', '2025-08-06 12:11:37', 0),
(3, 'Оптимизация интерфейса банковского приложения', '2025-08-06 - 2025-08-12', 2, '2025-08-05 15:50:05', 'Команда (дизайнер + аналитик) получает задачу улучшить юзабилити и повысить конверсию в мобильном приложении банка. Пользователи жалуются на сложность перевода денег и поиска нужных функций.', 'success', '2025-08-06 12:21:11', 1),
(4, 'EcoTrack: трекер устойчивых привычек', '2025-08-19 - 2025-09-12', 2, '2025-08-05 15:52:23', 'Команда разрабатывает мобильное приложение, которое помогает пользователям внедрять экологичные привычки (сортировка отходов, экономия воды/электричества, углеродный след и т.д.). Дизайнер и аналитик совместно прорабатывают концепцию, ориентируясь на вовлечение и удобство.', 'created', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `taskstaff`
--

CREATE TABLE `taskstaff` (
  `taskId` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `taskPost` text NOT NULL DEFAULT 'Сотрудник'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `taskstaff`
--

INSERT INTO `taskstaff` (`taskId`, `userId`, `taskPost`) VALUES
(1, 4, 'Руководитель проекта'),
(1, 5, 'Помощник, Курьер'),
(2, 4, 'Руководитель проекта'),
(2, 3, 'Аналитик'),
(3, 4, 'Руководитель проекта'),
(3, 3, 'Аналитик'),
(3, 2, 'Директор'),
(4, 4, 'Руководитель проекта'),
(4, 3, 'Аналитик'),
(4, 2, 'Директор');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `staff`
--
ALTER TABLE `staff`
  ADD PRIMARY KEY (`userId`),
  ADD KEY `userId` (`userId`);

--
-- Indexes for table `taskparts`
--
ALTER TABLE `taskparts`
  ADD PRIMARY KEY (`taskPartId`),
  ADD KEY `taskId` (`taskId`);

--
-- Indexes for table `taskreports`
--
ALTER TABLE `taskreports`
  ADD PRIMARY KEY (`taskReportId`),
  ADD KEY `reportUserId` (`reportUserId`),
  ADD KEY `reportTaskPart` (`reportTaskPart`);
ALTER TABLE `taskreports` ADD FULLTEXT KEY `reportDescr` (`reportDescr`);

--
-- Indexes for table `taskreport_staff`
--
ALTER TABLE `taskreport_staff`
  ADD KEY `fk_taskreport_staff_report` (`taskReportId`),
  ADD KEY `fk_taskreport_staff_user` (`userId`);

--
-- Indexes for table `tasks`
--
ALTER TABLE `tasks`
  ADD PRIMARY KEY (`taskId`),
  ADD KEY `taskCustomerId` (`taskCustomerId`);

--
-- Indexes for table `taskstaff`
--
ALTER TABLE `taskstaff`
  ADD KEY `userId` (`userId`),
  ADD KEY `taskId` (`taskId`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `staff`
--
ALTER TABLE `staff`
  MODIFY `userId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `taskparts`
--
ALTER TABLE `taskparts`
  MODIFY `taskPartId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `taskreports`
--
ALTER TABLE `taskreports`
  MODIFY `taskReportId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `tasks`
--
ALTER TABLE `tasks`
  MODIFY `taskId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `taskparts`
--
ALTER TABLE `taskparts`
  ADD CONSTRAINT `taskparts_ibfk_1` FOREIGN KEY (`taskId`) REFERENCES `tasks` (`taskId`);

--
-- Constraints for table `taskreports`
--
ALTER TABLE `taskreports`
  ADD CONSTRAINT `taskreports_ibfk_1` FOREIGN KEY (`reportUserId`) REFERENCES `staff` (`userId`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `taskreports_ibfk_3` FOREIGN KEY (`reportTaskPart`) REFERENCES `taskparts` (`taskPartId`);

--
-- Constraints for table `taskreport_staff`
--
ALTER TABLE `taskreport_staff`
  ADD CONSTRAINT `taskreport_staff_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `staff` (`userId`);

--
-- Constraints for table `tasks`
--
ALTER TABLE `tasks`
  ADD CONSTRAINT `tasks_ibfk_1` FOREIGN KEY (`taskCustomerId`) REFERENCES `staff` (`userId`) ON UPDATE CASCADE;

--
-- Constraints for table `taskstaff`
--
ALTER TABLE `taskstaff`
  ADD CONSTRAINT `taskstaff_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `staff` (`userId`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `taskstaff_ibfk_2` FOREIGN KEY (`taskId`) REFERENCES `tasks` (`taskId`) ON DELETE NO ACTION ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
