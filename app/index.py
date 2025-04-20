from flask import render_template, redirect, request, flash, url_for, session, send_file
from sqlalchemy import func

from app import app, login, db, dao, socketio, max_score_count_15, max_score_count_45
from flask_login import current_user, login_user, logout_user, login_required
import cloudinary
from cloudinary import uploader
import dao
from datetime import datetime

from models import UserEnum, Class, Teacher_Class, Student_Class, GradeEnum, Teacher, Subject_Teacher_Class, Subject, \
    Score, ScoreTypeEnum, School_Year

from io import BytesIO
from openpyxl import Workbook

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
    try:
        data = request.get_json()

        if not data:
            return jsonify({'success': False, 'message': 'Không nhận được dữ liệu JSON'}), 400

        classname = data.get("classname")
        grade = data.get("grade")
        teacher_id = data.get("teacher_id")
        student_ids = data.get("student_ids")

        if not classname or not grade or not teacher_id:
            return jsonify({'success': False, 'message': 'Thiếu thông tin lớp học'}), 400

        # Kiểm tra lớp đã tồn tại chưa
        existing_class = Class.query.filter_by(name=classname).first()
        if existing_class:
            return jsonify({'success': False, 'message': 'Lớp học đã tồn tại'})

        # Tạo lớp
        new_class = Class(name=classname, grade=grade, number_of_students=len(student_ids))
        db.session.add(new_class)
        db.session.commit()

        # Gán giáo viên
        teacher_class = Teacher_Class(teacher_id=teacher_id, class_id=new_class.id, date_of_join=datetime.now())
        db.session.add(teacher_class)

        # Gán học sinh
        for student_id in student_ids:
            student = Student.query.get(student_id)
            if student and not student.classes:  # chỉ thêm nếu chưa có lớp
                student_class = Student_Class(student_id=student_id, class_id=new_class.id, date_of_join=datetime.now())
                db.session.add(student_class)

        db.session.commit()

        return jsonify({'success': True, 'message': 'Lớp học đã được tạo thành công.'})

    except Exception as e:
        print("Lỗi khi lưu lớp học:", str(e))  # In ra log server
        return jsonify({'success': False, 'message': f'Lỗi server: {str(e)}'}), 500

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

@app.route('/api/save_edit_class', methods=['POST'])
def save_edit_class():
    data = request.get_json()
    class_id = data.get("class_id")
    teacher_id = data.get("teacher_id")
    student_ids = data.get("student_ids", [])

    try:
        # --- Cập nhật giáo viên chủ nhiệm ---
        if teacher_id:
            # Xóa giáo viên cũ (nếu có)
            Teacher_Class.query.filter_by(class_id=class_id).delete()
            # Gán giáo viên mới
            new_tc = Teacher_Class(teacher_id=teacher_id, class_id=class_id)
            db.session.add(new_tc)

        # --- Cập nhật học sinh ---
        # Xóa toàn bộ học sinh cũ trong lớp
        Student_Class.query.filter_by(class_id=class_id).delete()

        # Thêm mới danh sách học sinh (nếu có)
        for sid in student_ids:
            sc = Student_Class(student_id=sid, class_id=class_id)
            db.session.add(sc)

        cls = dao.load_class(class_id)
        if cls:
            cls.number_of_students = len(student_ids)

        db.session.commit()
        return jsonify({'message': 'Cập nhật lớp học thành công!'})

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Lỗi khi cập nhật: {str(e)}'})

@app.route('/update_score')
def update_score():
    grades=dao.load_gradeEnum()
    semesters=dao.load_semester()
    max_15 = max_score_count_15
    max_45 = max_score_count_45

    return render_template("update_score.html",grades = grades,semesters = semesters,
                           max_15 = max_15, max_45 = max_45)

@app.route('/api/get_classes_by_grade/<grade>', methods=['GET'])
def get_classes_by_grade(grade):

    grade_enum = GradeEnum[grade]
    classes = dao.load_class(grade=grade_enum)
    result = [{'id': cls.id, 'name': cls.name} for cls in classes]
    return jsonify(result)

@app.route('/api/get_subject_by_teachID_classID/<int:class_id>', methods=['GET'])
def get_subject_by_teachID_classID(class_id):
    if not current_user.is_authenticated:
        return {"error": "Unauthorized"}

    teacher = Teacher.query.filter_by(user_id=current_user.id).first()
    if not teacher:
        return {"error": "Teacher not found"}

    stc_list = Subject_Teacher_Class.query \
        .filter_by(teacher_id=teacher.id, class_id=class_id) \
        .join(Subject) \
        .all()

    result = [{"id": stc.subject.id, "name": stc.subject.name} for stc in stc_list]

    return jsonify(result)

@app.route('/api/save_update_score', methods=['POST'])
def save_update_score():
    data = request.get_json()

    semester_id = data.get("semester_id")
    subject_id = data.get("subject_id")
    scores = data.get("scores", [])

    if not semester_id or not subject_id:
        return jsonify({"success": False, "message": "Các trường phải cập nhật đầy đủ"})

    skipped_students = []  # Danh sách học sinh bị bỏ qua

    try:
        for s in scores:
            student_id = s.get("student_id")

            # Truy vấn điểm hiện có của học sinh đó
            existing_scores = Score.query.filter_by(
                student_id=student_id,
                subject_id=subject_id,
                semester_id=semester_id
            ).all()

            # Kiểm tra điều kiện
            count_15 = sum(1 for score in existing_scores if score.score_type == ScoreTypeEnum.DIEM_15)
            count_45 = sum(1 for score in existing_scores if score.score_type == ScoreTypeEnum.DIEM_45)
            has_exam = any(score.score_type == ScoreTypeEnum.DIEM_THI for score in existing_scores)

            if count_15 >= 5 or count_45 >= 3 or has_exam:
                skipped_students.append(student_id)
                continue  # Bỏ qua học sinh này

            # Nếu chưa đủ, thêm điểm
            for val in s.get("score15p", []):
                if val is not None:
                    db.session.add(Score(
                        student_id=student_id,
                        semester_id=semester_id,
                        subject_id=subject_id,
                        score=val,
                        score_type=ScoreTypeEnum.DIEM_15,
                    ))

            for val in s.get("score45p", []):
                if val is not None:
                    db.session.add(Score(
                        student_id=student_id,
                        semester_id=semester_id,
                        subject_id=subject_id,
                        score=val,
                        score_type=ScoreTypeEnum.DIEM_45,
                    ))

            # Thêm điểm thi nếu chưa có
            exam_score = s.get("exam_score")
            if exam_score is not None:
                existing_exam_score = next(
                    (score for score in existing_scores if score.score_type == ScoreTypeEnum.DIEM_THI),
                    None
                )
                if not existing_exam_score:
                    db.session.add(Score(
                        student_id=student_id,
                        semester_id=semester_id,
                        subject_id=subject_id,
                        score=exam_score,
                        score_type=ScoreTypeEnum.DIEM_THI,
                    ))

        db.session.commit()

        if skipped_students:
            return jsonify({
                "success": True,
                "message": f"Cập nhật điểm thành công. {len(skipped_students)} học sinh đã đủ điểm nên bị bỏ qua.",
                "skipped": skipped_students
            })
        else:
            return jsonify({"success": True, "message": "Cập nhật điểm thành công."})

    except Exception as ex:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Lỗi khi cập nhật: {str(ex)}'})

def calculate_avg_semester(student_id, semester_id):
    avg_15 = db.session.query(func.avg(Score.score)).filter_by(
        student_id=student_id,
        semester_id=semester_id,
        score_type=ScoreTypeEnum.DIEM_15
    ).scalar()
    print(f"Điểm 15' học sinh {student_id} học kỳ {semester_id}: {avg_15}")

    avg_45 = db.session.query(func.avg(Score.score)).filter_by(
        student_id=student_id,
        semester_id=semester_id,
        score_type=ScoreTypeEnum.DIEM_45
    ).scalar()
    print(f"Điểm 45' học sinh {student_id} học kỳ {semester_id}: {avg_45}")

    exam_score = db.session.query(Score.score).filter_by(
        student_id=student_id,
        semester_id=semester_id,
        score_type=ScoreTypeEnum.DIEM_THI
    ).scalar()
    print(f"Điểm thi học sinh {student_id} học kỳ {semester_id}: {exam_score}")

    if avg_15 is not None and avg_45 is not None and exam_score is not None:
        final_avg = round((avg_15 + avg_45 * 2 + exam_score * 3) / 6, 2)
    else:
        final_avg = None

    return final_avg


@app.route('/api/get_score_by_class_id/<int:class_id>/<int:school_year_id>', methods=['GET'])
def get_score_by_class_id(class_id,school_year_id):
    cls = Class.query.get(class_id)
    school_year=School_Year.query.get(school_year_id)
    if not cls or not school_year:
        return jsonify({'error': 'Không tim thấy lớp hoặc năm học'})

    for s in school_year.semesters:
        print(s.id, s.name)
    semesters=school_year.semesters
    semester1 = next((s for s in semesters if s.name.startswith("HK1")), None)
    semester2 = next((s for s in semesters if s.name.startswith("HK2")), None)
    result = []

    for sc in cls.students:
        student = sc.student

        avg_hk1 = calculate_avg_semester(student.id, semester1.id) if semester1 else None
        avg_hk2 = calculate_avg_semester(student.id, semester2.id) if semester2 else None

        avg_total = round(((avg_hk1 or 0) + (avg_hk2 or 0)) / 2, 2) if avg_hk1 and avg_hk2 else None

        result.append({
            'id': student.id,
            'fullname': student.fullname,
            'class': cls.name,
            'avg_semester1': avg_hk1,
            'avg_semester2': avg_hk2,
            'avg_total': avg_total
        })
    print("====== TỔNG KẾT ======")
    for item in result:
        print(item)

    return jsonify(result)

@app.route('/api/export_score', methods=['POST'])
def export_score():
    school_year_id = request.form.get('schoolyears')
    class_id = request.form.get('class_id')

    cls = Class.query.get(class_id)
    school_year = School_Year.query.get(school_year_id)

    if not cls or not school_year:
        return jsonify({'error': 'Không tìm thấy lớp hoặc năm học'}), 404

    # Khởi tạo workbook và worksheet
    wb = Workbook()
    ws = wb.active
    ws.title = "Bảng Điểm"

    # Thêm tiêu đề cho các cột
    ws.append(["STT", "Họ và tên", "Điểm trung bình HK1", "Điểm trung bình HK2", "Điểm tổng kết"])

    # Lặp qua học sinh trong lớp để lấy điểm
    for index, sc in enumerate(cls.students, start=1):
        student = sc.student
        avg_hk1 = calculate_avg_semester(student.id, 1)
        avg_hk2 = calculate_avg_semester(student.id, 2)
        avg_total = round(((avg_hk1 or 0) + (avg_hk2 or 0)) / 2, 2) if avg_hk1 and avg_hk2 else None

        # Thêm thông tin học sinh vào sheet
        ws.append([
            index,
            student.fullname,
            avg_hk1 if avg_hk1 is not None else "-",
            avg_hk2 if avg_hk2 is not None else "-",
            avg_total if avg_total is not None else "-"
        ])

    # Lưu workbook vào bộ nhớ và gửi file cho người dùng
    output = BytesIO()
    wb.save(output)
    output.seek(0)

    return send_file(output, as_attachment=True, download_name="bang_diem.xlsx", mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")

@app.route('/export_score')
def export_score_form():
    schoolyears = dao.load_school_year()
    grades=dao.load_gradeEnum()
    return render_template("export_score.html",schoolyears=schoolyears,grades=grades)

if __name__ == '__main__':
    from app.admin import *

    app.run(debug=True)