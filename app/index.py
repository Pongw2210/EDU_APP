from flask import render_template, redirect, request, flash, url_for, session
from app import app,login,db,dao,socketio
from flask_login import current_user, login_user, logout_user, login_required
import cloudinary
from cloudinary import uploader
import dao
from datetime import datetime
#
from models import UserEnum, Class, Teacher_Class, Student_Class

from io import BytesIO
from openpyxl import Workbook

# import warnings
# from sqlalchemy.exc import SAWarning
#
# warnings.filterwarnings('ignore', category=SAWarning)

from flask_socketio import join_room,leave_room,send,SocketIO
import random
from string import ascii_uppercase

@app.route('/')
def home():
    return render_template("index.html")

@app.route('/login', methods=['get', 'post'])
def login_my_user():
    if current_user.is_authenticated:
        return redirect('/')

    err_msg = None
    username = ''
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')

        user = dao.auth_user(username=username, password=password)

        if user:
            login_user(user)
            if user.role == UserEnum.ADMIN:
                return redirect('/admin')
            return redirect('/')
        else:
            err_msg = "Tài khoản hoặc mật khẩu không khớp!"

    return render_template('login.html', err_msg=err_msg, username=username)

@login.user_loader
def get_user(user_id):
    return dao.get_user_by_id(user_id=user_id)

@app.route("/logout")
def logout_my_user():
    logout_user()
    return redirect('/login')

@app.route('/user_info')
def user_info():
    return render_template('user_info.html')

@app.route('/upload-avatar', methods=['POST'])
@login_required
def upload_avatar():
    avatar = request.files.get('avatar')

    if avatar:
        upload_result = cloudinary.uploader.upload(
            avatar,
            folder='avatars',
            public_id=f"user_{current_user.id}",
            overwrite=True,
            resource_type="image"
        )

        avatar_url = upload_result.get('secure_url')
        current_user.avatar = avatar_url
        db.session.commit()

        flash('Cập nhật ảnh đại diện thành công!', 'success')
    else:
        flash('Chưa chọn file nào để upload!', 'warning')

    return redirect(url_for('profile'))

rooms = {}

def generate_unique_code(length):
    while True:
        code = ""
        for _ in range(length):
            code += random.choice(ascii_uppercase)

        if code not in rooms:
            break

    return code

@app.route("/home_chat", methods=["POST", "GET"])
@login_required
def home_chat():
    # Chỉ xóa key chat, không clear toàn bộ session
    session.pop("room", None)
    session.pop("name", None)

    if request.method == "POST":
        name = request.form.get("name")
        code = request.form.get("code")
        join = request.form.get("join", False)
        create = request.form.get("create", False)

        if not name:
            return render_template("chat/home_chat.html", error="Hãy nhập tên của bạn.", code=code, name=name)

        if join != False and not code:
            return render_template("chat/home_chat.html", error="Hãy nhập mã phòng của cuộc trò chuyện.", code=code, name=name)

        room = code
        if create != False:
            room = generate_unique_code(4)
            rooms[room] = {"members": 0, "messages": []}
        elif code not in rooms:
            return render_template("chat/home_chat.html", error="Mã phòng này không tồn tại.", code=code, name=name)

        session["room"] = room
        session["name"] = name
        return redirect(url_for("room"))

    return render_template("chat/home_chat.html")

@app.route("/room")
def room():
    room = session.get("room")
    if room is None or session.get("name") is None or room not in rooms:
        return redirect(url_for("home_chat"))

    return render_template("chat/room.html", code=room, messages=rooms[room]["messages"])

@socketio.on("message")
def message(data):
    room = session.get("room")
    if room not in rooms:
        return

    content = {
        "name": session.get("name"),
        "message": data["data"]
    }
    send(content, to=room)
    rooms[room]["messages"].append(content)
    print(f"{session.get('name')} said: {data['data']}")

@socketio.on("connect")
def connect(auth):
    room = session.get("room")
    name = session.get("name")
    if not room or not name:
        return
    if room not in rooms:
        leave_room(room)
        return

    join_room(room)
    send({"name": name, "message": "đã tham gia cuộc trò chuyện"}, to=room)
    rooms[room]["members"] += 1
    print(f"{name} joined room {room}")

@socketio.on("disconnect")
def disconnect():
    room = session.get("room")
    name = session.get("name")
    leave_room(room)

    if room in rooms:
        rooms[room]["members"] -= 1
        if rooms[room]["members"] <= 0:
            del rooms[room]

    send({"name": name, "message": "đã rời khỏi cuộc trò chuyện"}, to=room)
    print(f"{name} has left the room {room}")

@app.route("/register_student")
def register_student():
    max_age = dao.get_max_age()
    min_age = dao.get_min_age()


    return render_template("register_student.html",
                           max_age=max_age,min_age=min_age)

@app.route('/api/save_student', methods=['POST'])
def save_student():
    data = request.get_json()

    # Lấy dữ liệu từ form
    fullname = data.get('fullname')
    dob = data.get('dob')
    gender = data.get('gender')
    address = data.get('address')
    phone = data.get('phone')
    email = data.get('email')

    # Kiểm tra tất cả trường phải được điền đầy đủ
    if not fullname or not dob or not gender or not address or not phone:
        return jsonify({"success": False, "message": "Tất cả các trường phải được điền đầy đủ (ngoại trừ email)!"})

    # Tạo đối tượng Student mới
    new_student = Student(
        fullname=fullname,
        dob=dob,
        gender=gender,
        address=address,
        phone=phone,
        email=email
    )

    # Thêm sinh viên vào cơ sở dữ liệu
    try:
        db.session.add(new_student)
        db.session.commit()
        return jsonify({"success": True, "message": "Dữ liệu đã được lưu thành công!"})

    except Exception as e:
        db.session.rollback()  # Rollback nếu có lỗi
        return jsonify({"success": False, "message": "Có lỗi xảy ra khi lưu dữ liệu: " + str(e)})

@app.route('/add_class')
def add_class():
    grades=dao.load_gradeEnum()
    available_teachers=dao.load_teachers_with_assign_status()
    available_students=dao.load_students_with_assign_status()
    max_student = dao.get_max_student()
    return render_template("add_class.html",grades=grades,
                           available_teachers=available_teachers,available_students=available_students,
                           max_student=max_student)

@app.route('/api/save_class', methods=['POST'])
def save_class():
    data = request.get_json()
    classname = data.get("classname")
    grade = data.get("grade")
    teacher_id = data.get("teacher_id")
    student_ids = data.get("student_ids")

    # Kiểm tra xem lớp học đã tồn tại chưa
    existing_class = Class.query.filter_by(name=classname).first()
    if existing_class:
        return jsonify({'success': False, 'message': 'Lớp học đã tồn tại'})

    # Tạo lớp học mới
    new_class = Class(name=classname, grade=grade, number_of_students=len(student_ids))
    db.session.add(new_class)
    db.session.commit()

    # Liên kết giáo viên chủ nhiệm với lớp
    teacher_class = Teacher_Class(teacher_id=teacher_id, class_id=new_class.id, time=datetime.now())
    db.session.add(teacher_class)
    db.session.commit()

    # Liên kết học sinh với lớp
    for student_id in student_ids:
        student = Student.query.get(student_id)
        if student and not student.classes:  # chỉ thêm nếu chưa có lớp nào
            student_class = Student_Class(student_id=student_id, class_id=new_class.id, date_of_join=datetime.now())
            db.session.add(student_class)

    db.session.commit()

    return jsonify({'success': True, 'message': 'Lớp học đã được tạo thành công.'})

@app.route('/edit_class')
def edit_class():
    classes=dao.load_class()
    teachers=dao.load_teachers_with_assign_status()
    unassigned_students=dao.load_unassigned_students()
    return render_template("edit_class.html",classes=classes,teachers=teachers,
                           unassigned_students=unassigned_students)
@app.route('/api/class_info/<int:class_id>')
def get_class_info(class_id):
    cls = dao.load_class(class_id)

    # Tìm giáo viên chủ nhiệm
    teacher_class = Teacher_Class.query.filter_by(class_id=class_id).first()
    teacher = teacher_class.teacher if teacher_class else None

    # Lấy danh sách học sinh từ bảng phụ student_class
    student_data = [{
        'id': sc.student.id,
        'fullname': sc.student.fullname,
        'dob': sc.student.dob.strftime('%d/%m/%Y'),
        'gender': sc.student.gender,
        'address': sc.student.address,
        'phone': sc.student.phone,
        'email': sc.student.email
    } for sc in cls.students]

    return jsonify({
        'teacher_name': teacher.fullname if teacher else 'Chưa có giáo viên',
        'students': student_data
    })

if __name__ == '__main__':
    from app.admin import *

    app.run(debug=True)