PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS employees (id INTEGER PRIMARY KEY, username TEXT NOT NULL UNIQUE, name TEXT NOT NULL, role TEXT NOT NULL, avatar TEXT NOT NULL, color TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS users (username TEXT PRIMARY KEY, password_hash TEXT NOT NULL, role TEXT NOT NULL CHECK (role IN ('admin', 'employee')), employee_id INTEGER REFERENCES employees(id));
CREATE TABLE IF NOT EXISTS publications (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, code TEXT NOT NULL UNIQUE, type TEXT NOT NULL CHECK (type IN ('图书', '期刊')), deadline TEXT NOT NULL, note TEXT NOT NULL DEFAULT '', cover INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS assignments (publication_id INTEGER NOT NULL REFERENCES publications(id) ON DELETE CASCADE, employee_id INTEGER NOT NULL REFERENCES employees(id), topic TEXT NOT NULL DEFAULT '', note TEXT NOT NULL DEFAULT '', updated_at TEXT NOT NULL DEFAULT '', PRIMARY KEY (publication_id, employee_id));
CREATE INDEX IF NOT EXISTS idx_assignments_employee ON assignments(employee_id);

INSERT OR IGNORE INTO employees VALUES
  (1, 'linmo', '林默', '责任编辑', '林', 'purple'),
  (2, 'zhouxiao', '周晓', '文字编辑', '周', 'blue'),
  (3, 'chenxu', '陈叙', '设计编辑', '陈', 'green'),
  (4, 'xuyan', '许言', '审校编辑', '许', 'rose'),
  (5, 'tangtang', '唐棠', '文字编辑', '唐', 'orange');

-- 演示密码均为 123456；上线前请更换这些账号的密码散列。
INSERT OR IGNORE INTO users VALUES
  ('admin', 'cc2049269b227986d6bcd24c6e45ff35:607b7faca9f6dcfc7d54e3a217ef16817860c0146162583227aa52b2fdc2fc90', 'admin', NULL),
  ('linmo', '52551757454c31b1fd25e2dbe6593687:dac17d9b4b99411ac75e1cd8d49dd5926136ff95c4f9bfec986fb2eee681e0af', 'employee', 1),
  ('zhouxiao', 'c6895016dc421d653b78cc718a86f2fd:d4749712b441d01419183eb7b1013b4f2209870595eb3e97a2560ecf699cfcc6', 'employee', 2),
  ('chenxu', '14caec179b127aa738f595572c7993eb:921337475ab81929e15825f3dedf2a5aa7131bc224428711c19a6f9881c6da8', 'employee', 3),
  ('xuyan', '2565e4f640832c60d6de6520186827b5:2f564df96a989a34d063cf2aca7247381f87b2d0b29e23158b4477b581553492', 'employee', 4),
  ('tangtang', 'b9697b88183c91aedf4371232c7c1f2e:998249bfecadcd81196fe12a8018d0a99a944bbc539fcf8d259ba1dc380a5b07', 'employee', 5);
