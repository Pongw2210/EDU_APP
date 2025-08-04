EDU_APP – Hệ thống Quản lý Học sinh
EDU_APP là một hệ thống quản lý học sinh được phát triển bằng Flask, hỗ trợ các chức năng quản lý học sinh, giáo viên, phụ huynh, lớp học, môn học, năm học, học kỳ và điểm số. Hệ thống phân quyền chặt chẽ giữa nhiều vai trò: Admin, Giáo viên, Học sinh, Phụ huynh.

Tính năng chính
Đối với Admin
Quản lý người dùng (CRUD tài khoản học sinh, giáo viên, phụ huynh)

Quản lý lớp học, môn học, năm học, học kỳ

Phân công giáo viên dạy lớp - môn

Xem thống kê tổng quan hệ thống

Đối với Giáo viên
Xem danh sách lớp mình phụ trách

Nhập điểm học sinh theo môn

Xem điểm tổng kết của lớp

Đối với Học sinh
Xem thông tin cá nhân

Xem điểm học tập

Đối với Phụ huynh
Xem thông tin học tập và điểm số của con em mình

Kiến trúc hệ thống
Backend: Flask (Python), SQLAlchemy, Flask-Login, Flask-WTF

Frontend: Jinja2 templates, Bootstrap

Cơ sở dữ liệu: MySQL

Cấu trúc thư mục
bash
Sao chép
Chỉnh sửa
EDU_APP/
├── app/
│   ├── data/
│   │   ├── models.py         # Khai báo ORM models
│   ├── auth/                 # Xử lý đăng nhập, đăng ký
│   ├── admin/                # Quản lý cho admin
│   ├── teacher/              # Chức năng cho giáo viên
│   ├── student/              # Giao diện học sinh
│   ├── parent/               # Giao diện phụ huynh
│   ├── static/               # Tài nguyên tĩnh: CSS, JS, ảnh
│   ├── templates/            # Jinja2 templates
│   └── ...
├── migrations/               # Quản lý migrations (Flask-Migrate)
├── main.py                   # Entry point
├── config.py                 # Cấu hình ứng dụng
└── requirements.txt          # Danh sách thư viện
Hướng dẫn chạy dự án
Cài đặt môi trường
Clone repo:

bash
Sao chép
Chỉnh sửa
git clone https://github.com/Pongw2210/EDU_APP.git
cd EDU_APP
Tạo môi trường ảo và cài thư viện:

bash
Sao chép
Chỉnh sửa
python -m venv venv
source venv/bin/activate  # Hoặc venv\Scripts\activate trên Windows
pip install -r requirements.txt
Cấu hình cơ sở dữ liệu trong config.py

Khởi tạo database:

bash
Sao chép
Chỉnh sửa
flask db init
flask db migrate
flask db upgrade
Chạy ứng dụng:

bash
Sao chép
Chỉnh sửa
python main.py
Ứng dụng sẽ chạy tại http://127.0.0.1:5000/

Tài khoản mẫu
Vai trò	Tên đăng nhập	Mật khẩu
Admin	admin	admin123
Giáo viên	teacher1	pass123
Học sinh	student1	pass123
Phụ huynh	parent1	pass123

Có thể thay đổi trong cơ sở dữ liệu hoặc tạo mới tài khoản thông qua giao diện Admin.

Lưu ý
Dự án còn đang trong quá trình phát triển, có thể chưa đầy đủ tính năng.

Cần cài đặt MySQL và tạo database trước khi chạy ứng dụng.

Nếu gặp lỗi liên quan đến cấu hình DB, kiểm tra config.py hoặc biến môi trường.

Đóng góp
Bạn có thể đóng góp bằng cách:

Tạo Pull Request với các tính năng mới hoặc sửa lỗi

Mở Issue để báo cáo lỗi hoặc đề xuất tính năng

Fork repo để phát triển ý tưởng riêng

License
Dự án sử dụng MIT License.

Nếu bạn muốn, mình có thể tạo luôn file README.md để bạn paste trực tiếp vào repo. Muốn thêm hình ảnh hoặc video demo thì cứ nói nhé.








