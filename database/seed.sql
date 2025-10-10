-- Seed data for the Colleague Calendar database
USE colleague_calendar;

-- Insert core demo users (idempotent)
INSERT INTO users (id, first_name, last_name, email, password_hash, company, location, shift_preferences, avatar_url, info_hide)
VALUES
  (1, 'Kari', 'Nordmann', 'kari@example.com', '$2y$10$kYb1o8my8NBlRAXXc0kfG.8I/ZXY7OqT5gIOh/9m8b9eyZqsVfXde', 'Helsehuset Oslo', 'Oslo', JSON_OBJECT('defaultShift', 'day'), NULL, 0),
  (2, 'Thomas', 'Berg', 'thomas@example.com', '$2y$10$kYb1o8my8NBlRAXXc0kfG.8I/ZXY7OqT5gIOh/9m8b9eyZqsVfXde', 'Helsehuset Oslo', 'Oslo', JSON_OBJECT('rotation', '2on-2off'), NULL, 0),
  (3, 'Fatima', 'Rahman', 'fatima@example.com', '$2y$10$kYb1o8my8NBlRAXXc0kfG.8I/ZXY7OqT5gIOh/9m8b9eyZqsVfXde', 'Helsehuset Oslo', 'Oslo', JSON_OBJECT('focus', 'night'), NULL, 0),
  (4, 'Lars', 'Hansen', 'lars@example.com', '$2y$10$kYb1o8my8NBlRAXXc0kfG.8I/ZXY7OqT5gIOh/9m8b9eyZqsVfXde', 'Helsehuset Oslo', 'Oslo', JSON_OBJECT('role', 'support'), NULL, 0)
ON DUPLICATE KEY UPDATE
  first_name = VALUES(first_name),
  last_name = VALUES(last_name),
  company = VALUES(company),
  location = VALUES(location),
  shift_preferences = VALUES(shift_preferences),
  info_hide = VALUES(info_hide);

-- Reset AUTO_INCREMENT to the next available id
ALTER TABLE users AUTO_INCREMENT = 5;

-- Confirmed colleague pairs
INSERT IGNORE INTO friends (user_id, colleague_id)
VALUES
  (1, 2), (2, 1),
  (1, 3), (3, 1),
  (1, 4), (4, 1),
  (2, 3), (3, 2);

-- Close colleagues for Kari
INSERT IGNORE INTO close_colleagues (user_id, colleague_id)
VALUES
  (1, 2),
  (1, 3);

-- Pending request example
INSERT INTO friend_requests (sender_id, recipient_id, status, message)
VALUES
  (4, 2, 0, 'Skal vi koordinere helgevakter?')
ON DUPLICATE KEY UPDATE
  status = VALUES(status),
  message = VALUES(message),
  responded_at = NULL;

-- Deviation samples
INSERT INTO shift_deviations (user_id, shift_id, start_date, pattern, work_cycles, off_cycles, duration_days, keep_rhythm, note)
VALUES
  (1, 'self-2024-07-14', '2024-07-14', 'Permisjon bursdag', 0, 0, 1, 0, 'Fri for familiefeiring'),
  (2, 'thomas-2024-05-17', '2024-05-17', 'Byttet til morgenvakt', 0, 0, 1, 0, '17. mai feiring')
ON DUPLICATE KEY UPDATE
  pattern = VALUES(pattern),
  note = VALUES(note);

-- Remember token example (hash only, never real token)
INSERT INTO remember_tokens (user_id, token_hash, user_agent, expires_at)
VALUES
  (1, '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'CLI seed', DATE_ADD(NOW(), INTERVAL 30 DAY))
ON DUPLICATE KEY UPDATE
  expires_at = VALUES(expires_at);
