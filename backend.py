# Created on: 10/24/19
# Created by: Nick Lamos 011557486

from __future__ import print_function
import sys
from flask import Flask, jsonify, request
from flask_cors import CORS
import flask_sqlalchemy as sqlalchemy
from sqlalchemy import func
from flask_bcrypt import Bcrypt

import datetime

app = Flask(__name__)
bcrypt = Bcrypt(app)
CORS(app)
#app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///TAFinder-TEST.db'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///TAFinder.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] =  False

db = sqlalchemy.SQLAlchemy(app)


class Professor(db.Model):
    __tablename__ = 'Professor'
    # username = db.Column(db.String(30))
    firstname = db.Column(db.String(30))
    lastname = db.Column(db.String(30))
    space = db.Column(db.String(128))
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100))
    password = db.Column(db.String(30))
    course = db.relationship('Course',backref='professor')

class Student(db.Model):
    __tablename__ = 'Student'
    # username = db.Column(db.String(30))
    firstname = db.Column(db.String(30))
    lastname = db.Column(db.String(30))
    space = db.Column(db.String(128))
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100))
    password = db.Column(db.String(30))
    course = db.relationship('TACourse',backref='student') # all TA applications a student applies for
    assigned_ta = db.Column(db.Boolean, default=False)

class Course(db.Model):
    __tablename__ = 'Course'
    course_number = db.Column(db.String(50))
    lab_number = db.Column(db.String(50))
    course_id = db.Column(db.Integer, primary_key=True) 
    #sid = db.Column(db.Integer, db.ForeignKey('Student.id'))
    pid = db.Column(db.Integer, db.ForeignKey('Professor.id')) # this gets set to prof's WSU ID
    ta_assigned = db.Column(db.Boolean, default=False) # t/f -> has a TA been assinged for this class ?
    TA_name = db.Column(db.String(50))
    applications = db.relationship('TACourse', backref='course')

# Need new table for classes student applies to be TA for
# this will be joined with Student table AND Course table
class TACourse(db.Model):
    __tablename__ = 'TACourse'
    course_number = db.Column(db.String(50))
    lab_number = db.Column(db.String(50))
    app_id = db.Column(db.Integer, primary_key=True)
    #course_id = db.column(db.Integer, db.ForeignKey('Course.course_id')) # Course table's primary key
    student_id = db.Column(db.Integer, db.ForeignKey('Student.id')) # Student table's primary key
    course_id = db.Column(db.Integer, db.ForeignKey('Course.course_id')) 
    ta_assigned = db.Column(db.Boolean, default=False)

base_url = '/api/'

##############################################################################################################
############## TEST FUNCTIONS
@app.route(base_url + 'testDisplayCourseAndProfessor', methods=['GET'])
def testDisplayCourseAndProfessor():

    query = Course.query.filter_by(email=username).first()
    if query is None:
        return "No courses exists", 500

    result = []
    for row in query.course:
        result.append(
            row_to_obj_course(row)
        )

    return jsonify({"status": 1, "testDisplayCourseAndProfessor": result})


###############################################################


@app.route(base_url + 'accounts', methods=['GET'])
def getAccounts():
	space = request.args.get('space', None)
	if space is None:
		return "Must provide space", 500
	students = Student.query.filter_by(space=space).all()
	professors = Professor.query.filter_by(space=space).all()
	
	result = []
	for i in students:
		result.append(row_to_obj_student(i))
	for j in professors:
		result.append(row_to_obj_prof(j))
	
	return jsonify({"status": 1, "all_accounts": result})

@app.route(base_url + 'accounts', methods=['DELETE'])
def deleteAllAccounts():
	space = request.args.get('space', None) 
	if space is None:
		return "Must provide space", 500

	Student.query.filter_by(space=space).delete()
	Professor.query.filter_by(space=space).delete()
	Course.query.delete()
	TACourse.query.delete()

	db.session.commit()	
	return jsonify({"status": 1}), 200

@app.route(base_url + 'loginstudent', methods=['GET'])
def loginstudent():
    # get inputed email and password
    username = request.args.get('username', None)
    password = request.args.get('password', None)
    if username is None:
        return {"status": -1, "error": "must provide username"}, 500
    if password is None:
        return {"status": -1, "error": "must provide password"}, 500
    # searches for the given email in db
    query = Student.query.filter_by(email=username).first()
    if query is None:
        return "error - no student account exists with this email", 500
    # make sure inputed password matches the one with the email in db
    if bcrypt.check_password_hash(query.password, password) == False:
        return "error - wrong password", 500
    result = row_to_obj_student(query)
    return jsonify({"status": 1, "student": result})

@app.route(base_url + 'loginprofessor', methods=['GET'])
def loginprofessor():
    # get inputed email and password
    username = request.args.get('username', None)
    password = request.args.get('password', None)
    if username is None:
        return {"status": -1, "error": "must provide username"}, 500
    if password is None:
        return {"status": -1, "error": "must provide password"}, 500
    # searches for the given email in db
    query = Professor.query.filter_by(email=username).first()
    if query is None:
        return "error - no professor account exists with this email", 500
    # make sure inputed password matches the one with the email in db
    if bcrypt.check_password_hash(query.password, password) == False:
        return "error - wrong password", 500
    result = row_to_obj_prof(query)
    return jsonify({"status": 1, "professor": result})
    
@app.route(base_url + 'allcourses', methods=['GET'])
def displayCourses():
    # count = request.args.get('count', None)
    # order_by = request.args.get('order_by', None)

    query = Course.query.all()
    #query2 = TACourse.query.all()

    result = []
    for row in query:
        #print(row.keys())
        result.append(
            row_to_obj_course(row)
        )
    # for row in query2:
    #     #print(row.keys())
    #     result.append(
    #         row_to_obj_TAcourse(row)
    #     )

    return jsonify({"status": 1, "courses": result})

# returns all of a given professor's Courses
# queries the Professor table, filter by username
@app.route(base_url + 'professorcourses', methods=['GET'])
def displayProfessorsCourses():
    username = request.args.get('username', None)
    if username is None:
        return "Must provide username", 500
    #****************************************************************************
    # UPDATED DATABASE TABLE TO JOIN COURSES WITH PROFESSOR
    query = Professor.query.filter_by(email=username).first()
    if query is None:
        return "No courses exists", 500

    result = []
    for row in query.course:
        result.append(
            row_to_obj_course(row)
        )

    return jsonify({"status": 1, "ProfessorsCourses": result})

# returns all of a given student's TA applications
# queries the Student table, filter by username
@app.route(base_url + 'studentapplications', methods=['GET'])
def displayStudentApplications():
    username = request.args.get('username', None)
    if username is None:
        return "Must provide username", 500
    query = Student.query.filter_by(email=username).first()
    if query is None:
        return "No student application exists", 500
    
    result = []
    # Established relationship btw 'course' field in Student table to TAcourse table
    for row in query.course:
        result.append(
            # created row to obj for TAcourse table
            row_to_obj_TAcourse(row)
        )

    return jsonify({"status": 1, "StudentApplications": result})

# returns all the entries in Courses table
@app.route(base_url + 'GetAllProfessorCourses', methods=['GET'])
def GetAllProfessorCourses():
    query = Course.query.all()
    if query is None:
        return "No courses in (Professor) Course table - create a course first!", 500

    result = []
    for row in query:
        result.append(
            row_to_obj_course(row) 
        )

    return jsonify({"status": 1, "GetAllProfessorCourses": result})

# returns all the entries in TACourse table
@app.route(base_url + 'GetAllStudentCourses', methods=['GET'])
def GetAllStudentCourses():
    query = TACourse.query.all()
    if query is None:
        return "No courses in TACourse table - create a course first!", 500

    result = []
    for row in query:
        result.append(
            row_to_obj_TAcourse(row) 
        )

    return jsonify({"status": 1, "GetAllStudentCourses": result})

@app.route(base_url + 'applications', methods=['GET'])
def displayApplications():
    course = request.args.get('course', None)
    lab = request.args.get('lab', None)
    if course is None:
        return "Must provide username", 500

    ta_course = TACourse.query.filter_by(course_number=course).filter_by(lab_number=lab)
    if ta_course is None:
        return "No student application exists", 500

    #print(ta_course)
    result = []
    for row in ta_course:
        result.append(
            row_to_obj_TAcourse(row)
        )

    return jsonify({"status": 1, "students": result})

##################################### Professor
@app.route(base_url + 'getinstructor', methods=['GET'])
def getProf():
    # count = request.args.get('count', None)
    # order_by = request.args.get('order_by', None)

    query = Professor.query.all()

    result = []
    for row in query:
        result.append(
            row_to_obj_prof(row)
        )

    return jsonify({"status": 1, "professors": result})

@app.route(base_url + 'addinstructor', methods=['POST'])
def createInstructor():
    # data = request.json
    professor = Professor(**request.json)
    professor.password = bcrypt.generate_password_hash(professor.password).decode('utf-8')
    db.session.add(professor)
    db.session.commit()
    db.session.refresh(professor)

    return jsonify({"status": 1, "professors": row_to_obj_prof(professor)}), 200

@app.route(base_url + 'deleteinstructor', methods=['DELETE'])
def deleteinstructor():
    myid = request.args.get('id', None)

    if myid is None or myid is '':
        return {"status": -1, "error": "must provide id"}, 500

    Professor.query.filter_by(id=myid).delete()
    #Professor.query.delete()
    db.session.commit()

    return jsonify({"status": 1}), 200

@app.route(base_url + 'editinstructor', methods=['POST'])
def editinstructor():
    username = request.args.get('username', None)

    if username is None or username is '':
        return {"status": -1, "error": "must provide username"}, 500

    instructor = Professor.query.filter_by(email=username).first()
    if instructor is None or instructor is '':
        return {"status": -1, "error": "professor doesnt exists"}, 500

    data = request.json

    for k,v in data.items():
        setattr(instructor, k, v)

    instructor.password = bcrypt.generate_password_hash(instructor.password).decode('utf-8')
    
    db.session.commit()
    db.session.refresh(instructor)

    return jsonify({"status": 1}), 200

################################# Student
@app.route(base_url + 'getallstudent', methods=['GET'])
def getAllStudent():
    student = Student.query.all()

    result = []
    for row in student:
        result.append(
            row_to_obj_student(row)
        )

    return jsonify({"status": 1, "students": result})

@app.route(base_url + 'getstudent', methods=['GET'])
def getStudent():
    # count = request.args.get('count', None)
    # order_by = request.args.get('order_by', None)
    studentID = request.args.get('id', None)
    if studentID is None or studentID is '':
        return {"status":-1, "error": "must provide id"}, 500
    student = Student.query.filter_by(id=studentID)
    if student is None or student is '':
        return {"status": -1, "error": "No student"}, 500
    #student = Student.query.all()

    result = []
    for row in student:
        result.append(
            row_to_obj_student(row)
        )

    return jsonify({"status": 1, "students": result})

@app.route(base_url + 'addstudent', methods=['POST'])
def createStudent():
    #data = request.json

    # THIS IS WEHRE THE POST REQUEST WENT WRONG 
    # IT SAYS SOMETHING ABOUT NAME IS AN INVALID KEYWORD FOR STUDENT
    student = Student(**request.json)
    student.password = bcrypt.generate_password_hash(student.password).decode('utf-8')
    db.session.add(student)
    db.session.commit()
    db.session.refresh(student)

    return jsonify({"status": 1, "students": row_to_obj_student(student)}), 200


@app.route(base_url + 'deletestudent', methods=['DELETE'])
def deletestudent():
    myid = request.args.get('id', None)

    if myid is None or myid is '':
        return {"status": -1, "error": "must provide id"}, 500

    Student.query.filter_by(id=myid).delete()
    #Student.query.delete()
    db.session.commit()

    return jsonify({"status": 1}), 200
    
@app.route(base_url + 'editstudent', methods=['POST'])
def editStudent():
    username = request.args.get('username', None)

    if username is None or username is '':
        return {"status": -1, "error": "must provide username"}, 500

    student = Student.query.filter_by(email=username).first()
    if student is None or student is '':
        return {"status": -1, "error": "student doesnt exists"}, 500

    data = request.json

    for k,v in data.items():
        setattr(student, k, v)

    student.password = bcrypt.generate_password_hash(student.password).decode('utf-8')
    
    db.session.commit()
    db.session.refresh(student)

    return jsonify({"status": 1}), 200

################################### Course
@app.route(base_url + 'getTAcourse', methods=['GET'])
def getTACourse():
    query = TACourse.query.all()

    result = []
    for row in query:
        result.append(
            row_to_obj_TAcourse(row)
        )

    return jsonify({"status": 1, "TAcourses": result})

@app.route(base_url + 'addTAcourse', methods=['POST'])
def addTACourse():
    course = TACourse(**request.json)
    # person_id = course.person_id
    db.session.add(course)
    db.session.commit()
    db.session.refresh(course)

    return jsonify({"status": 1, "courses": row_to_obj_TAcourse(course)}), 200

@app.route(base_url + 'deleteTAcourse', methods=['DELETE'])
def deleteTAcourse():
    course = request.args.get('course_number', None)
    lab = request.args.get('lab', None)
    if course is None or course is '':
        return {"status": -1, "error": "must provide id"}, 500

    TACourse.query.filter_by(course_number=course).filter_by(lab_number=lab).delete()
    #TACourse.query.delete()
    db.session.commit()

    return jsonify({"status": 1}), 200

@app.route(base_url + 'getcourse', methods=['GET'])
def getCourse():
    query = Course.query.all()

    result = []
    for row in query:
        result.append(
            row_to_obj_course(row)
        )

    return jsonify({"status": 1, "courses": result})

@app.route(base_url + 'addcourse', methods=['POST'])
def addCourse():
    course = Course(**request.json)
    # person_id = course.person_id
    db.session.add(course)
    db.session.commit()
    db.session.refresh(course)

    return jsonify({"status": 1, "courses": row_to_obj_course(course)}), 200

@app.route(base_url + 'deletecourse', methods=['DELETE'])
def deletecourse():
    course = request.args.get('course_number', None)
    lab = request.args.get('lab', None)
    if course is None or course is '':
        return {"status": -1, "error": "must provide id"}, 500

    Course.query.filter_by(course_number=course).filter_by(lab_number=lab).delete()
    TACourse.query.filter_by(course_number=course).filter_by(lab_number=lab).delete()
    #Course.query.delete()
    db.session.commit()

    return jsonify({"status": 1}), 200

# creates a new Course (Added by Professor) associated with username provided
# var attachProfessorCourseHandler in javascript
@app.route(base_url + 'addProfessorCourse', methods=['POST'])
def addProfessorCourse():
    newCourse = Course(**request.json)
    # get username and password supplied in POST request
    username = request.args.get('username', None)
    password = request.args.get('password', None)
    if username is None:
        return "Must provide username", 500
    if password is None:
        return "Must provide password", 500

    # get courses from database that match username (email)
    query = Professor.query.filter_by(email=username).first()
    if query is None:
        return "No account exists with that username", 500

    eCourse = Course.query.filter_by(course_number=newCourse.course_number).filter_by(lab_number=newCourse.lab_number).first()
    if eCourse is not None:
        return "You already applied for this course", 50
    # create common identifier in Professor and Course tables
    # assign the Prof's WSU iD as the course table's course_id
    newCourse.pid = query.id

    # add the new course in
    query.course.append(newCourse)

    db.session.add(newCourse)
    db.session.commit()
    db.session.refresh(newCourse)

    return jsonify({"status": 1, "courses": row_to_obj_course(newCourse)}), 200


# creates a new TAcourse application (when a student applies to be a TA)
@app.route(base_url + 'addStudentTAcourse', methods=['POST'])
def addStudentTAcourse():
    newCourse = TACourse(**request.json)
    # get username and password supplied in POST request
    username = request.args.get('username', None)
    password = request.args.get('password', None)
    if username is None:
        return "Must provide username", 500
    if password is None:
        return "Must provide password", 500

    # get courses from database that match username (email)
    query = Student.query.filter_by(email=username).first()
    if query is None:
        return "No account exists with that username", 500

    eCourse = TACourse.query.filter_by(course_number=newCourse.course_number).filter_by(lab_number=newCourse.lab_number).first()
    if eCourse is not None:
        return "You already applied for this course", 500
    # create common identifier in Professor and Course tables
    # assign the Prof's WSU iD as the course table's course_id
    newCourse.student_id = query.id

    # add the new course in
    query.course.append(newCourse)
    #query.TAcourse.append(newCourse)
    db.session.add(newCourse)
    db.session.commit()
    db.session.refresh(newCourse)

    return jsonify({"status": 1, "courses": row_to_obj_TAcourse(newCourse)}), 200

@app.route(base_url + 'assignTA', methods=['POST'])
def assignTA():
    # What it expects in the requested json: course_number, lab_number, TAname, TA_id
    info = request.json
    if info is None:
        return "json empty", 500

    # get username and password supplied in POST request
    username = request.args.get('username', None)
    password = request.args.get('password', None)
    if username is None:
        return "Must provide username", 500
    if password is None:
        return "Must provide password", 500

    querycourse = Course.query.filter_by(course_number=info["course_number"]).first()
    if querycourse is None:
        return "No course with that course number exists", 500

    querycourse.ta_assigned = True
    querycourse.TA_name = info["TAname"]

    querystudent = Student.query.filter_by(id=info["TA_id"]).first()
    if querystudent is None:
        return "No student with that id exists", 500

    tacourse = TACourse.query.filter_by(course_number=info["course_number"]).first()
    tacourse.ta_assigned = True

    querystudent.assigned_ta = True

    db.session.add(querycourse)
    db.session.add(querystudent)
    db.session.commit()
    db.session.refresh(querycourse)
    db.session.refresh(querystudent)

    return jsonify({"status": 1}), 200



def row_to_obj_prof(row):
    myrow = {
            "firstname": row.firstname,
            "lastname": row.lastname,
            "id": row.id,
            "email": row.email,
            "password": row.password,
            #"course": row.course
        }
    return myrow

def row_to_obj_student(row):
    myrow = {
            "firstname": row.firstname,
            "lastname": row.lastname,
            "id": row.id,
            "email": row.email,
            "password": row.password,
            "assigned_ta": row.assigned_ta
        }
    return myrow

def row_to_obj_course(row):
    myrow = {
            "course_number": row.course_number,
            "lab_number": row.lab_number,
            "course_id": row.course_id,
            "pid": row.pid,
            "ta_assigned": row.ta_assigned,
            "TA_name": row.TA_name
        }
    return myrow

def row_to_obj_TAcourse(row):
    myrow = {
        "app_id": row.app_id,
        "course_number": row.course_number,
        "lab_number": row.lab_number,
        "student_id": row.student_id,
        "course_id": row.course_id,
        "ta_assigned": row.ta_assigned
    }
    return myrow

def main():
    db.create_all()
    app.run()

if __name__ == '__main__':
    app.debug = True
    main()