-- 数据库表结构（可选：如果未来需要使用 D1 数据库）

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin', 'employee')),
  name TEXT,
  email TEXT,
  employee_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 员工表
CREATE TABLE IF NOT EXISTS employees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  avatar TEXT,
  color TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 书刊表
CREATE TABLE IF NOT EXISTS publications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('图书', '期刊')),
  deadline DATE,
  note TEXT,
  cover INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 任务分配表
CREATE TABLE IF NOT EXISTS assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  publication_id INTEGER NOT NULL,
  employee_id INTEGER NOT NULL,
  topic TEXT,
  note TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (publication_id) REFERENCES publications(id) ON DELETE CASCADE,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  UNIQUE(publication_id, employee_id)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_assignments_publication ON assignments(publication_id);
CREATE INDEX IF NOT EXISTS idx_assignments_employee ON assignments(employee_id);
CREATE INDEX IF NOT EXISTS idx_publications_type ON publications(type);
CREATE INDEX IF NOT EXISTS idx_publications_deadline ON publications(deadline);

-- 插入初始员工数据
INSERT OR IGNORE INTO employees (id, username, name, role, avatar, color) VALUES
  (1, 'linmo', '林默', '责任编辑', '林', 'purple'),
  (2, 'zhouxiao', '周晓', '文字编辑', '周', 'blue'),
  (3, 'chenxu', '陈叙', '设计编辑', '陈', 'green'),
  (4, 'xuyan', '许言', '审校编辑', '许', 'rose'),
  (5, 'tangtang', '唐棠', '文字编辑', '唐', 'orange');

-- 插入初始用户数据（密码应该加密，这里仅作演示）
INSERT OR IGNORE INTO users (username, password_hash, role, email) VALUES
  ('admin', '$2a$10$...hash...', 'admin', 'admin@kanxing.cn');

-- 触发器：自动更新 updated_at
CREATE TRIGGER IF NOT EXISTS update_publications_timestamp
AFTER UPDATE ON publications
BEGIN
  UPDATE publications SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_assignments_timestamp
AFTER UPDATE ON assignments
BEGIN
  UPDATE assignments SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
