# Created on: 12/02/19
# Created by: Nick Lamos 011557486

import unittest
import os
import testLib

class TestTALink(testLib.RestTestCase):
	
	def testCreateStudent(self):
		"""
		Test creating a student account
		"""
		respCreate = self.makeRequest("/api/addstudent", method="POST",
                                    data = { 'firstname' : 'StudentFirst',
                                             'lastname' : 'StudentLast',
                                             'space' : self.accountSpace,
                                             'id' : 11110000,
                                             'email' : 'studentfirst.studentlast@wsu.edu',
											 'password' : 'test'
                                             })
		self.assertSuccessResponse(respCreate)
		self.assertEqual('StudentFirst', respCreate['students']['firstname'])
		self.assertEqual('StudentLast', respCreate['students']['lastname'])

		respGet = self.getAccounts()
		self.assertSuccessResponse(respGet)
		self.assertEqual(1, len(respGet['all_accounts']))
		self.assertEqual(respCreate['students']['id'], respGet['all_accounts'][0]['id'])	
			
	def testCreateProfessor(self):
		"""
		Test creating a professor account
		"""
		respCreate = self.makeRequest("/api/addinstructor", method="POST",
                                    data = { 'firstname' : 'ProfessorFirst',
                                             'lastname' : 'ProfessorLast',
                                             'space' : self.accountSpace,
                                             'id' : 11110000,
                                             'email' : 'professorfirst.professorlast@wsu.edu',
											 'password' : 'test'
                                             })
		self.assertSuccessResponse(respCreate)
		self.assertEqual('ProfessorFirst', respCreate['professors']['firstname'])
		self.assertEqual('ProfessorLast', respCreate['professors']['lastname'])
		
		respGet = self.getAccounts()
		self.assertSuccessResponse(respGet)
		self.assertEqual(1, len(respGet['all_accounts']))
		self.assertEqual(respCreate['professors']['id'], respGet['all_accounts'][0]['id'])

	def testLoginStudent(self):
		"""
		Test logging into a student account
		"""
		respCreate = self.makeRequest("/api/addstudent", method="POST",
                                    data = { 'firstname' : 'StudentFirst',
                                             'lastname' : 'StudentLast',
                                             'space' : self.accountSpace,
                                             'id' : 11110000,
                                             'email' : 'studentfirst.studentlast@wsu.edu',
											 'password' : 'test'
                                             })
		self.assertSuccessResponse(respCreate)
		self.assertEqual('StudentFirst', respCreate['students']['firstname'])
		self.assertEqual('StudentLast', respCreate['students']['lastname'])
		
		testUrl = "/api/loginstudent?username="+respCreate['students']['email']+"&password=test"
		respGet = self.makeRequest(testUrl, method="GET")
		self.assertSuccessResponse(respGet)
		self.assertEqual('StudentFirst', respCreate['students']['firstname'])
		self.assertEqual('StudentLast', respCreate['students']['lastname'])

	def testLoginProfessor(self):
		"""
		Test logging into a professor account
		"""
		respCreate = self.makeRequest("/api/addinstructor", method="POST",
                                    data = { 'firstname' : 'ProfessorFirst',
                                             'lastname' : 'ProfessorLast',
                                             'space' : self.accountSpace,
                                             'id' : 11110000,
                                             'email' : 'professorfirst.professorlast@wsu.edu',
											 'password' : 'test'
                                             })
		self.assertSuccessResponse(respCreate)
		self.assertEqual('ProfessorFirst', respCreate['professors']['firstname'])
		self.assertEqual('ProfessorLast', respCreate['professors']['lastname'])

		tUrl = "/api/loginprofessor?username="+respCreate['professors']['email']+"&password=test"
		respGet = self.makeRequest(tUrl, method="GET")
		self.assertSuccessResponse(respGet)
		self.assertEqual('ProfessorFirst', respCreate['professors']['firstname'])
		self.assertEqual('ProfessorLast', respCreate['professors']['lastname'])
		
	def testAddProfessorCourse(self):
		"""
		Test adding a course to a professor's account
		"""
		respCreate = self.makeRequest("/api/addinstructor", method="POST",
                                    data = { 'firstname' : 'ProfessorFirst',
                                             'lastname' : 'ProfessorLast',
                                             'space' : self.accountSpace,
                                             'id' : 11110000,
                                             'email' : 'professorfirst.professorlast@wsu.edu',
											 'password' : 'test'
                                             })
		self.assertSuccessResponse(respCreate)
		self.assertEqual('ProfessorFirst', respCreate['professors']['firstname'])
		self.assertEqual('ProfessorLast', respCreate['professors']['lastname'])

		testUrl = "/api/addProfessorCourse?username="+respCreate['professors']['email']+"&password="+respCreate['professors']['password']
		respPref = self.makeRequest(testUrl, method="POST",
									data = { 'course_number' : 'CptS 479',
											 'lab_number' : '2',
											 'course_id' : 69,
										  	 'pid': 11110000
											})
		self.assertEqual('CptS 479', respPref['courses']['course_number'])
		self.assertEqual('2', respPref['courses']['lab_number'])
		
		testUrl = "/api/professorcourses?username="+respCreate['professors']['email']
		respGet = self.makeRequest(testUrl, method="GET")
		self.assertEqual('CptS 479', respGet['ProfessorsCourses'][0]['course_number'])
		self.assertEqual('2', respGet['ProfessorsCourses'][0]['lab_number'])

		
	def testAddStudentCourse(self):
		"""
		Test adding a course to a student's account
		"""
		respCreate = self.makeRequest("/api/addstudent", method="POST",
                                    data = { 'firstname' : 'StudentFirst',
                                             'lastname' : 'StudentLast',
                                             'space' : self.accountSpace,
                                             'id' : 11110000,
                                             'email' : 'studentfirst.studentlast@wsu.edu',
											 'password' : 'test'
                                             })
		self.assertSuccessResponse(respCreate)
		self.assertEqual('StudentFirst', respCreate['students']['firstname'])
		self.assertEqual('StudentLast', respCreate['students']['lastname'])

		testUrl = "/api/addStudentTAcourse?username="+respCreate['students']['email']+"&password="+respCreate['students']['password']
		respPref = self.makeRequest(testUrl, method="POST",
									data = { 'app_id' : 69,
											 'course_number' : 'CptS 479',
											 'lab_number' : '2',
										  	 'student_id': 11110000
											})
		self.assertEqual('CptS 479', respPref['courses']['course_number'])
		self.assertEqual('2', respPref['courses']['lab_number'])
		
		testUrl = "/api/getTAcourse"
		respGet = self.makeRequest(testUrl, method="GET")
		self.assertEqual('CptS 479', respGet['TAcourses'][0]['course_number'])
		self.assertEqual('2', respGet['TAcourses'][0]['lab_number'])

	def testEditStudent(self):
		"""
		Test editing a student's account
		"""
		respCreate = self.makeRequest("/api/addstudent", method="POST",
                                    data = { 'firstname' : 'StudentFirst',
                                             'lastname' : 'StudentLast',
                                             'space' : self.accountSpace,
                                             'id' : 11110000,
                                             'email' : 'studentfirst.studentlast@wsu.edu',
											 'password' : 'test'
                                             })
		self.assertSuccessResponse(respCreate)
		self.assertEqual('StudentFirst', respCreate['students']['firstname'])
		self.assertEqual('StudentLast', respCreate['students']['lastname'])

		testUrl = "/api/editstudent?username="+respCreate['students']['email']
		respPref = self.makeRequest(testUrl, method="POST",
									data = { 
										  	 'firstname': 'NewStudentFirst'
											})
		
		testUrl = "/api/getstudent?id="+str(respCreate['students']['id'])
		respGet = self.makeRequest(testUrl, method="GET")
		self.assertEqual('NewStudentFirst', respGet['students'][0]['firstname'])

	def testEditProfessor(self):
		"""
		Test editing a professors's account
		"""
		respCreate = self.makeRequest("/api/addinstructor", method="POST",
                                    data = { 'firstname' : 'ProfessorFirst',
                                             'lastname' : 'ProfessorLast',
                                             'space' : self.accountSpace,
                                             'id' : 11110000,
                                             'email' : 'professorfirst.professorlast@wsu.edu',
											 'password' : 'test'
                                             })
		self.assertSuccessResponse(respCreate)
		self.assertEqual('ProfessorFirst', respCreate['professors']['firstname'])
		self.assertEqual('ProfessorLast', respCreate['professors']['lastname'])

		testUrl = "/api/editinstructor?username="+respCreate['professors']['email']
		respPref = self.makeRequest(testUrl, method="POST",
									data = { 
										  	 'firstname': 'NewProfessorFirst'
											})
		
		testUrl = "/api/getinstructor"
		respGet = self.makeRequest(testUrl, method="GET")
		self.assertEqual('NewProfessorFirst', respGet['professors'][0]['firstname'])

if __name__ == '__main__':
	unittest.main()