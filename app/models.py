from sqlalchemy.orm import relationship, validates
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

class Admin(Base):
    __tablename__="admin"
    __table_args__ = {'extend_existing': True}
    fullname = Column(String(100),nullable=False)
    email = Column(String(100), nullable=True)
    gender=Column(String(10),nullable=False)
    user_id = Column(Integer, ForeignKey('user.id'), nullable=True)

class Teacher(Base):
    __tablename__="teacher"
    __table_args__ = {'extend_existing': True}
    fullname = Column(String(100),nullable=False)
    email = Column(String(100), nullable=True)
    gender=Column(String(10),nullable=False)
    user_id = Column(Integer, ForeignKey('user.id'), nullable=True)

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


if __name__ =="__main__":
    with app.app_context():
        # db.drop_all()
        db.create_all()

        admin1=Admin(fullname="Đặng Mỹ Ngọc",email="dmn@gmail.com",gender="Nữ")
        db.session.add(admin1)
        uAdmin1 = User(username="userAdmin", password=str(hashlib.md5("123".encode('utf-8')).hexdigest()),
                  avatar="https://res.cloudinary.com/dgqx9xde1/image/upload/v1744900055/User2_qjswcy.webp",
                  role=UserEnum.ADMIN)
        uAdmin1.admin = admin1
        db.session.add(uAdmin1)
        db.session.commit()

        teacher1=Teacher(fullname="Nguyễn Ngọc Anh",email="nna@gmail.com",gender="Nữ")
        db.session.add(teacher1)
        uTeacher1 = User(username="userGVien", password=str(hashlib.md5("123".encode('utf-8')).hexdigest()),
                  avatar="https://res.cloudinary.com/dgqx9xde1/image/upload/v1744900183/User3_byutxj.jpg",
                  role=UserEnum.GIAOVIEN)
        uTeacher1.teacher = teacher1
        db.session.add(uTeacher1)
        db.session.commit()


        staff1 = Staff(fullname="Trần Bảo Ngọc", email="tbn@gmail.com", gender="Nữ")
        db.session.add(staff1)
        uStaff1 = User(username="userGVu", password=str(hashlib.md5("123".encode('utf-8')).hexdigest()))
        uStaff1.staff=staff1
        db.session.add(uStaff1)
        db.session.commit()