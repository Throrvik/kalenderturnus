-- Colleague Calendar database schema
-- Run this file against a MySQL 8.0+ server to create all tables.

CREATE DATABASE IF NOT EXISTS colleague_calendar
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE colleague_calendar;

-- Users hold the core profile data and authentication material
CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  company VARCHAR(150) DEFAULT NULL,
  location VARCHAR(150) DEFAULT NULL,
  shift_preferences JSON DEFAULT NULL,
  avatar_url VARCHAR(255) DEFAULT NULL,
  info_hide TINYINT(1) NOT NULL DEFAULT 0,
  reset_token VARCHAR(255) DEFAULT NULL,
  reset_token_expiry DATETIME DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email)
) ENGINE=InnoDB;

-- Confirmed colleague relationships
CREATE TABLE IF NOT EXISTS friends (
  user_id INT UNSIGNED NOT NULL,
  colleague_id INT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, colleague_id),
  CONSTRAINT fk_friends_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_friends_colleague
    FOREIGN KEY (colleague_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Pending/accepted/rejected requests
CREATE TABLE IF NOT EXISTS friend_requests (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  sender_id INT UNSIGNED NOT NULL,
  recipient_id INT UNSIGNED NOT NULL,
  status TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '0=pending,1=accepted,2=rejected',
  message VARCHAR(500) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  responded_at TIMESTAMP NULL DEFAULT NULL,
  CONSTRAINT chk_friend_requests_status CHECK (status IN (0, 1, 2)),
  CONSTRAINT fk_friend_requests_sender
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_friend_requests_recipient
    FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_friend_request (sender_id, recipient_id)
) ENGINE=InnoDB;

-- User favourites
CREATE TABLE IF NOT EXISTS close_colleagues (
  user_id INT UNSIGNED NOT NULL,
  colleague_id INT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, colleague_id),
  CONSTRAINT fk_close_colleagues_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_close_colleagues_colleague
    FOREIGN KEY (colleague_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Deviations from standard shift patterns
CREATE TABLE IF NOT EXISTS shift_deviations (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  shift_id VARCHAR(150) DEFAULT NULL,
  start_date DATE NOT NULL,
  pattern VARCHAR(255) DEFAULT NULL,
  work_cycles TINYINT UNSIGNED DEFAULT 0,
  off_cycles TINYINT UNSIGNED DEFAULT 0,
  duration_days SMALLINT UNSIGNED DEFAULT NULL,
  keep_rhythm TINYINT(1) NOT NULL DEFAULT 0,
  note TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_shift_deviations_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_shift_deviations_user_date (user_id, start_date)
) ENGINE=InnoDB;

-- Remember-me tokens for persistent logins
CREATE TABLE IF NOT EXISTS remember_tokens (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  token_hash CHAR(64) NOT NULL,
  user_agent VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  CONSTRAINT fk_remember_tokens_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_remember_tokens_hash (token_hash),
  INDEX idx_remember_tokens_user (user_id)
) ENGINE=InnoDB;
