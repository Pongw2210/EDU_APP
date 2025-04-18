from sqlalchemy.orm import relationship
from app import app, db
from enum import Enum as RoleEnum
from sqlalchemy import Column, Integer, String, Enum, DateTime, ForeignKey, CheckConstraint,Float
from datetime import datetime
from flask_login import UserMixin
import hashlib

class Base(db.Model):
    __abstract__ = True
    id = Column(Integer, primary_key=True, autoincrement=True)

class UserEnum(RoleEnum):
    GIAOVIEN = "Giáo viên"
    GIAOVU = "Giáo vụ"
    ADMIN = "Người quản trị"

class GradeEnum(RoleEnum):
    KHOI_10 = "Khối 10"
    KHOI_11 = "Khối 11"
    KHOI_12 = "Khối 12"

class Admin_Regulation(Base):
    __tablename__="admin_regulation"
    __table_args__ = {'extend_existing': True}
    create_date = Column(DateTime, default=datetime.now())
    admin_id = Column(Integer, ForeignKey('admin.id'), nullable=True)
    regulation_id = Column(Integer, ForeignKey('regulation.id'), nullable=True)

class Regulation(Base):
    __tablename__="regulation"
    __table_args__ = {'extend_existing': True}
    name=Column (String(255),nullable=False)
    content=Column(String(255),nullable=False)
    admins = relationship(Admin_Regulation, backref="regulation", lazy=True)

class Admin(Base):
    __tablename__="admin"
    __table_args__ = {'extend_existing': True}
    fullname = Column(String(100),nullable=False)
    email = Column(String(100), nullable=True)
    gender=Column(String(10),nullable=False)
    user_id = Column(Integer, ForeignKey('user.id'), nullable=True)
    regulations = relationship(Admin_Regulation, backref="admin", lazy=True)

class Teacher_Class(Base):
    __tablename__="teacher_class"
    __table_args__ = {'extend_existing': True}
    teacher_id = Column(Integer, ForeignKey('teacher.id'),nullable=True)
    class_id = Column(Integer, ForeignKey('class.id'),nullable=True)
    time = Column(DateTime, default=datetime.now())

class Teacher(Base):
    __tablename__="teacher"
    __table_args__ = {'extend_existing': True}
    fullname = Column(String(100),nullable=False)
    email = Column(String(100), nullable=True)
    gender=Column(String(10),nullable=False)
    user_id = Column(Integer, ForeignKey('user.id'), nullable=True)
    classes = relationship(Teacher_Class, backref="teacher", lazy=True)

class Staff(Base):
    __tablename__="staff"
    __table_args__ = {'extend_existing': True}
    fullname = Column(String(100),nullable=False)
    email = Column(String(100), nullable=True)
    gender=Column(String(10),nullable=False)
    user_id = Column(Integer, ForeignKey('user.id'), nullable=True)

class User(Base, UserMixin):
    __tablename__="user"
    __table_args__ = {'extend_existing': True}
    username = Column(String(50), unique=True, nullable=False)
    password = Column(String(50), nullable=False)
    avatar = Column(String(300), default="https://res.cloudinary.com/dgqx9xde1/image/upload/v1744899995/User1_cmpdyi.jpg")
    role = Column(Enum(UserEnum), default=UserEnum.GIAOVU)
    joined_date=Column(DateTime,default=datetime.now())
    teacher = relationship(Teacher, uselist=False, backref="user", cascade="all, delete")
    staff = relationship(Staff, uselist=False, backref="user", cascade="all, delete")
    admin = relationship(Admin, uselist=False, backref="user", cascade="all, delete")

class Student_Class(Base):
    __tablename__="student_class"
    __table_args__ = {'extend_existing': True}
    student_id = Column(Integer, ForeignKey('student.id'), nullable=True)
    class_id = Column(Integer, ForeignKey('class.id'), nullable=True)
    date_of_join = Column(DateTime, default=datetime.now())

class Student(Base):
    __tablename__="student"
    __table_args__ = {'extend_existing': True}
    fullname = Column(String(100),nullable=False)
    dob = Column(DateTime, nullable=False)
    gender=Column(String(10),nullable=False)
    address=Column(String(300),nullable=False)
    phone=Column(String(10),nullable=False)
    email=Column(String(100),nullable=True)
    classes = relationship(Student_Class, backref="student", lazy=True)
    # scores = relationship(Score,backref="student",lazy=True)

class Class(Base):
    __tablename__="class"
    __table_args__ = {'extend_existing': True}
    name = Column(String(50),unique=True, nullable=False)
    number_of_students= Column(Integer,default=0)
    grade=Column(Enum(GradeEnum))
    students = relationship(Student_Class, backref="class", lazy=True)
    teachers = relationship(Teacher_Class, backref="class", lazy=True)


if __name__ =="__main__":
    with app.app_context():
        db.drop_all()
        # db.create_all()
        #
        # admin1=Admin(fullname="Đặng Mỹ Ngọc",email="dmn@gmail.com",gender="Nữ")
        # db.session.add(admin1)
        # uAdmin1 = User(username="userAdmin", password=str(hashlib.md5("123".encode('utf-8')).hexdigest()),
        #           avatar="https://res.cloudinary.com/dgqx9xde1/image/upload/v1744900055/User2_qjswcy.webp",
        #           role=UserEnum.ADMIN)
        # uAdmin1.admin = admin1
        # db.session.add(uAdmin1)
        # db.session.commit()
        #
        # teacher1=Teacher(fullname="Nguyễn Ngọc Anh",email="nna@gmail.com",gender="Nữ")
        # db.session.add(teacher1)
        # uTeacher1 = User(username="userGVien", password=str(hashlib.md5("123".encode('utf-8')).hexdigest()),
        #           avatar="https://res.cloudinary.com/dgqx9xde1/image/upload/v1744900183/User3_byutxj.jpg",
        #           role=UserEnum.GIAOVIEN)
        # uTeacher1.teacher = teacher1
        # db.session.add(uTeacher1)
        # db.session.commit()
        #
        #
        # staff1 = Staff(fullname="Trần Bảo Ngọc", email="tbn@gmail.com", gender="Nữ")
        # db.session.add(staff1)
        # uStaff1 = User(username="userGVu", password=str(hashlib.md5("123".encode('utf-8')).hexdigest()))
        # uStaff1.staff=staff1
        # db.session.add(uStaff1)
        # db.session.commit()
        #
        # regulations = [
        #     Regulation(name="Số tuổi tối đa", content="20"),
        #     Regulation(name="Số tuổi tối thiểu", content="15"),
        #     Regulation(name="Số học sinh tối đa", content="40")
        # ]
        #
        # for regulation in regulations:
        #     db.session.add(regulation)
        #
        # db.session.commit()
        #
        # students = [
        #     Student(fullname="Nguyễn Văn An", dob="2008-01-15", gender="Nam", address="123 Lê Lợi", phone="0901000001",
        #             email="an1@gmail.com"),
        #     Student(fullname="Trần Thị Bích", dob="2008-02-20", gender="Nữ", address="234 Nguyễn Trãi",
        #             phone="0901000002", email="bich2@gmail.com"),
        #     Student(fullname="Lê Minh Khoa", dob="2008-03-05", gender="Nam", address="345 Lý Thường Kiệt",
        #             phone="0901000003", email="khoa3@gmail.com"),
        #     Student(fullname="Phạm Ngọc Hân", dob="2008-04-12", gender="Nữ", address="456 Trần Hưng Đạo",
        #             phone="0901000004", email="han4@gmail.com"),
        #     Student(fullname="Hoàng Đức Tài", dob="2008-05-25", gender="Nam", address="567 CMT8", phone="0901000005",
        #             email="tai5@gmail.com"),
        #     Student(fullname="Đinh Thị Hằng", dob="2008-06-30", gender="Nữ", address="678 Nguyễn Du",
        #             phone="0901000006", email="hang6@gmail.com"),
        #     Student(fullname="Bùi Quốc Dũng", dob="2008-07-18", gender="Nam", address="789 Hùng Vương",
        #             phone="0901000007", email="dung7@gmail.com"),
        #     Student(fullname="Ngô Thị Yến", dob="2008-08-22", gender="Nữ", address="890 Điện Biên Phủ",
        #             phone="0901000008", email="yen8@gmail.com"),
        #     Student(fullname="Đoàn Anh Tuấn", dob="2008-09-10", gender="Nam", address="901 Võ Thị Sáu",
        #             phone="0901000009", email="tuan9@gmail.com"),
        #     Student(fullname="Trịnh Thị Mai", dob="2008-10-05", gender="Nữ", address="101 Nguyễn Huệ",
        #             phone="0901000010", email="mai10@gmail.com"),
        # ]
        # db.session.add_all(students)
        # db.session.commit()
        #
        # teacher2 = Teacher(fullname="Tần Minh Ngọc",email="tmn@gmail.com",gender="Nam")
        # teacher3 = Teacher(fullname="Phạm Ái Linh", email="pal@gmail.com", gender="Nữ")
        # teacher4 = Teacher(fullname="Lê Bảo An", email="lba@gmail.com", gender="Nam")
        # teacher5 = Teacher(fullname="Đỗ Quang Khải", email="dqk@gmail.com", gender="Nam")
        # teacher6 = Teacher(fullname="Tần Minh Thư", email="tmn@gmail.com", gender="Nữ")
        # db.session.add_all([teacher2,teacher3,teacher4,teacher5,teacher6])
        # db.session.commit()
        #
        # class1 = Class(name="10A1", grade=GradeEnum.KHOI_10)
        # db.session.add(class1)
        # class2 = Class(name="11A1", grade=GradeEnum.KHOI_11)
        # db.session.add(class2)
        # class3 = Class(name="12A1", grade=GradeEnum.KHOI_12)
        # db.session.add(class3)
        # db.session.commit()
        #
        # # Liên kết học sinh với lớp
        # student_class = Student_Class(student_id=students[0].id, class_id=class1.id,date_of_join=datetime.now())
        # db.session.add(student_class)
        # db.session.commit()
        #
        # teacher_class = Teacher_Class(teacher_id=teacher2.id, class_id=class1.id,time=datetime.now())
        # db.session.add(teacher_class)
        # db.session.commit()
