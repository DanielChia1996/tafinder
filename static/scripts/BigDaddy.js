// Created on: 10/20/19
// Created by: Daniel Chia 011562551

function BigDaddy() {
    // PRIVATE VARIBLES

    // Backend URL
    var apiUrl = 'http://127.0.0.1:5000';
    //var apiUrl = 'http://localhost:5000/';

    // students & professor container, value set in "start" method below
    var studentlist
    var instructorlist
    var courselist
    var classlist
    var showclass
    var talist
    // a template for creating students & instructors. Read from html file in the "start" method
    var studentTemplateHtml;
    var instructorTemplateHtml;
    var courseTemplateHtml;
    var classlistTemplateHtml;
    var talistTemplateHtml;

    // // reviews container, value set in the "start" method below
    // var reviews; 
    // // a template for creating reviews. Read from html file in the "start" method
    // var reviewTemplateHtml; 

    var add_student;    // add_student form, value set in the "start" method below
    var add_instructor; // add_instructor form, value set in the "start" method below
    var add_course;
    var delete_course;
    var edit_course;

    /////////////////////////////////////////////////////////////////////////////////////////////
    // PRIVATE METHODS
    /////////////////////////////////////////////////////////////////////////////////////////////
    /**
    * HTTP GET request 
    * @param  {string}   url         URL path, e.g. "/api/allprofs"
    * @param  {function} onSuccess   callback method to execute upon request success (200 status)
    * @param  {function} onFailure   callback method to execute upon request failure (non-200 status)
    * @return {None}
    */
    var makeGetRequest = function (url, onSuccess, onFailure) {
        $.ajax({
            type: 'GET',
            url: apiUrl + url,
            dataType: "json",
            success: onSuccess,
            error: onFailure
        });
    };

    /**
    * HTTP POST request
    * @param  {string}   url         URL path, e.g. "/api/allprofs"
    * @param  {Object}   data        JSON data to send in request body
    * @param  {function} onSuccess   callback method to execute upon request success (200 status)
    * @param  {function} onFailure   callback method to execute upon request failure (non-200 status)
    * @return {None}
    */
    var makePostRequest = function (url, data, onSuccess, onFailure) {
        $.ajax
            ({
                type: 'POST',
                url: apiUrl + url,
                data: JSON.stringify(data),
                contentType: "application/json",
                dataType: "json",
                success: onSuccess,
                error: onFailure
            });
    };

    /**
    * HTTP POST request
    * @param  {string}   url         URL path, e.g. "/api/allprofs"
    * @param  {Object}   data        JSON data to send in request body
    * @param  {function} onSuccess   callback method to execute upon request success (200 status)
    * @param  {function} onFailure   callback method to execute upon request failure (non-200 status)
    * @return {None}
    */
   var makeDeleteRequest = function (url, onSuccess, onFailure) {
    $.ajax
        ({
            type: 'DELETE',
            url: apiUrl + url,
            //data: JSON.stringify(data),
            contentType: "application/json",
            dataType: "json",
            success: onSuccess,
            error: onFailure
        });
};

    /**
    * Insert student into studentlist container in UI
    * @param  {Object}  student     student JSON
    * @param  {boolean} beginning   if true, insert student at the beginning of the list of studentlist
    * @return {None}
    */
    var insertStudent = function (student, beginning) {
        // Start with the template, make a new DOM element using jQuery
        var newElem = $(studentTemplateHtml);

        newElem.attr('id', student.id);
        newElem.find('.firstname').text(student.firstname);
        newElem.find('.lastname').text(student.lastname);
        newElem.find('.email').text(student.email);
        newElem.find('.password').text(student.password);
        newElem.find('.assigned_ta').text(student.assigned_ta);

        if (beginning) {
            studentlist.prepend(newElem);
        } else {
            studentlist.append(newElem);
        }

    };

    /**
    * Insert professor into professorlist container in UI
    * @param  {Object}  professor       professor JSON
    * @param  {boolean} beginning   if true, insert professor at the beginning of the list of professorlist
    * @return {None}
    */
    var insertInstructor = function (professor, beginning) {
        var newElem = $(instructorTemplateHtml);
        newElem.attr('id', professor.id);
        newElem.find('.firstname').text(professor.firstname);
        newElem.find('.lastname').text(professor.lastname);
        newElem.find('.email').text(professor.email);
        newElem.find('.password').text(professor.password);
        // newElem.find('.phone').text(instructor.phone);
        // newElem.find('.courses').text(instructor.courses);

        if (beginning) {
            instructorlist.prepend(newElem);
        } else {
            instructorlist.append(newElem);
        }
    };

    /**
    * Insert professor into professorlist container in UI
    * @param  {Object}  classes       professor JSON
    * @param  {boolean} beginning   if true, insert professor at the beginning of the list of professorlist
    * @return {None}
    */
    var insertClass = function (classes, beginning) {
        var newElem1 = $(classlistTemplateHtml);
        newElem1.attr('id', classes.id);
        newElem1.find('.course_name').text(classes.course_number);
        newElem1.find('.lab').text(classes.lab_number);
        newElem1.find('.status').text(classes.ta_assigned);
        newElem1.find('.instructor').text(classes.pid);
        newElem1.find('.instructor').text(classes.student_id);    

        if (beginning) {
            classlist.prepend(newElem1);
        } else {
            classlist.append(newElem1);
        }
    };

    /**
    * Insert professor into professorlist container in UI
    * @param  {Object}  ta       professor JSON
    * @param  {boolean} beginning   if true, insert professor at the beginning of the list of professorlist
    * @return {None}
    */
   var insertTa = function (ta, beginning) {
    var newElem = $(talistTemplateHtml);
    newElem.find('.student').text(ta.firstname); 
    newElem.find('.id').text(ta.id);   

    if (beginning) {
        talist.prepend(newElem);
    } else {
        talist.append(newElem);
    }
};

    /**
    * Add event handlers for submitting the create instructor form.
    * @return {None}
    */
    var attachInsructorHandler = function (e) {
        // Handler for 'create student' (.submit_studentInfo_input) button 
        add_instructor.on('click', '.submit_instructorInfo_input', function (e) {

            e.preventDefault(); // Tell the browser to skip its default click action

            var inst = {}; // Prepare the review object to send to the server

            var lUsername = add_instructor.find('.email_input').val();
            var lPassword = add_instructor.find('.password_input').val();

            // collect the rest of the data for the instructor
            // Refer to Create_Instructor_Page.html
            inst.firstname = add_instructor.find('.firstName_input').val();
            inst.lastname = add_instructor.find('.lastName_input').val();
            inst.id = add_instructor.find('.ID_input').val();
            inst.email = add_instructor.find('.email_input').val();
            inst.password = add_instructor.find('.password_input').val();

            var onSuccess = function (data) {
                window.localStorage.setItem("username", lUsername);
                window.localStorage.setItem("password", lPassword);
                insertInstructor(data.professors, true);
                window.location.href = "Next_Instructor_Page.html";
            };

            var onFailure = function () {
                alert("instructor cannot be created!");
                console.error('Create instructor - Failed');
            };

            // make a POST request to add the instructor
            makePostRequest('/api/addinstructor', inst, onSuccess, onFailure);
        });
    };

    /**
    * Add event handlers for submitting the create student form.
    * @return {None}
    */
   var attachStudentHandler = function (e) {
    // Handler for 'create student' (.submit_studentInfo_input) button 
    add_student.on('click', '.submit_studentInfo_input', function (e) {

        e.preventDefault(); // Tell the browser to skip its default click action

        var stud = {}; // Prepare the review object to send to the server

        var lUsername = add_student.find('.email_input').val();
        var lPassword = add_student.find('.password_input').val();

        // collect the rest of the data for the instructor
        // Refer to Create_Instructor_Page.html
        stud.firstname = add_student.find('.firstName_input').val();
        stud.lastname = add_student.find('.lastName_input').val();
        stud.id = add_student.find('.ID_input').val();
        stud.email = add_student.find('.email_input').val();
        stud.password = add_student.find('.password_input').val();
        //stud.assigned_ta = false;

        var onSuccess = function (data) {
            window.localStorage.setItem("username", lUsername);
            window.localStorage.setItem("password", lPassword);
            insertStudent(data.students, true);
            window.location.href = "Next_Student_Page.html";
        };

        var onFailure = function () {
            alert("student cannot be created!");
            console.error('Create student - Failed');
        };

        // make a POST request to add the instructor
        makePostRequest('/api/addstudent', stud, onSuccess, onFailure);
    });
};


var attachStudentSelectClassButtonHandler = function(e){
    // Handler for 'create student' (.submit_studentInfo_input) button 
    add_course.on('click', '.student_select_class_btn', function (e) {
        e.preventDefault();

        var lUsername = localStorage.getItem("username");
        console.log(lUsername)
        var lPassword = localStorage.getItem("password");
        console.log(lPassword)

        var courseTAstudent = {};

        courseTAstudent.course_number = $(this).parents('article').find('.course_name').text();
        courseTAstudent.lab_number = $(this).parents('article').find('.lab').text();
        
        console.log(courseTAstudent)
        var onSuccess = function(data) {
            window.location.href = "Save_Student_Page.html";
        };
        var onFailure = function () {
            alert("You already applied for this course!");
            console.error('Create Student TA Course - Failed');              
        };
        makePostRequest('/api/addStudentTAcourse?username=' + lUsername + '&password=' + lPassword, courseTAstudent, onSuccess, onFailure);
    });
}

    // /**
    // * Add event handlers for submitting a new course.
    // * @return {None}
    // */
    var attachCourseHandler = function (e) {
        // Handler for 'create student' (.submit_studentInfo_input) button 
        add_course.on('click', '.submit_studentInfo_input2', function (e) {
            e.preventDefault(); // Tell the browser to skip its default click action

            var c = {}; // Prepare the review object to send to the server

            // collect the rest of the data for the instructor
            // Refer to Create_Instructor_Page.html
            c.course_number = add_course.find('.course_name_input').val();
            c.lab_number = add_course.find('.lab_input').val();

            var onSuccess = function (data) {
                insertClass(data.courses, true);
                window.location.href = "Save_Student_Page.html";
            };

            var onFailure = function () {
                alert("Course cannot be created!");
                console.error('Create Course - Failed');
            };

            // make a POST request to add the instructor
            makePostRequest('/api/addTAcourse', c, onSuccess, onFailure);
        });

        // Handler for 'create student' (.submit_studentInfo_input) button 
        add_course.on('click', '.submit_instructorInfo_input2', function (e) {
            e.preventDefault(); // Tell the browser to skip its default click action

            var c = {}; // Prepare the review object to send to the server

            // collect the rest of the data for the instructor
            // Refer to Create_Instructor_Page.html
            c.course_number = add_course.find('.course_name_input').val();
            c.lab_number = add_course.find('.lab_input').val();

            var onSuccess = function (data) {
                insertClass(data.courses, true);
                window.location.href = "Save_Instructor_Page.html";
            };

            var onFailure = function () {
                alert("Course cannot be created!");
                console.error('Create Course - Failed');
            };

            // make a POST request to add the instructor
            makePostRequest('/api/addcourse', c, onSuccess, onFailure);
        });
    };

    // Event handler used when a Professor adds a new course
    // Sends a Post request with username in order to identify which professor teaches the course
    var attachProfessorCourseHandler = function(e) {
        // Handler for 'create professor' (.submit_instuctorInfo_input2) button
        add_course.on('click', '.submit_instructorInfo_input2', function(e) {
            e.preventDefault(); // Tell the browser to skip its default click action

            var lUsername = localStorage.getItem("username");
            console.log('got username');
            var lPassword = localStorage.getItem("password");
            console.log('got password');

            var courseProf = {}; // Prepare the review object to send to the server

            // collect the rest of the data for the instructor
            // Refer to Next_Instructor_Page.html
            courseProf.course_number = add_course.find('.course_name_input').val();
            courseProf.lab_number = add_course.find('.lab_input').val();
            console.log('got course num and lab num');

            var onSuccess = function(data) {
                //insertClass(data.courses, true);
                window.location.href = "Save_Instructor_Page.html";
            };

            var onFailure = function () {
                alert("You already registered this class!");
                console.error('Create Prof Course - Failed');
            };
            // Make Post request with username and password 
            makePostRequest('/api/addProfessorCourse?username=' + lUsername + '&password=' + lPassword, courseProf, onSuccess, onFailure);
        });
    }

    // Event handler used when a Student adds a new course
    // Sends a Post request with username in order to identify which professor teaches the course
    var attachStudentCourseHandler = function(e) {

        // Handler for 'create professor' (.submit_studentInfo_input2) button
        add_course.on('click', '.submit_studentInfo_input2', function(e) {
            e.preventDefault();

            var lUsername = localStorage.getItem("username");
            console.log(lUsername)
            var lPassword = localStorage.getItem("password");
            console.log(lPassword)

            var courseTAstudent = {};

            courseTAstudent.course_number = add_course.find('.course_name_input').val();
            courseTAstudent.lab_number = add_course.find('.lab_input').val();
            console.log(courseTAstudent)
            var onSuccess = function(data) {
                window.location.href = "Save_Student_Page.html";
            };
            var onFailure = function () {
                alert("Course cannot be created!");
                console.error('Create Student TA Course - Failed');              
            };
            makePostRequest('/api/addStudentTAcourse?username=' + lUsername + '&password=' + lPassword, courseTAstudent, onSuccess, onFailure);
        });

    }

    /**
     * Add event handlers for clicking select.
     * @return {None}
     */
    var attachDeleteHandler = function (e) {
        showlist.on('click', '.delete_btn', function (e)
        {
            e.preventDefault();

            var coursename = $(this).parents('article').find('.selected_course_name').text();
            var lab = $(this).parents('article').find('.selected_lab').text();

            var onSuccess = function(data){
                location.reload();
                alert("Class Deleted");
            }
            var onFailure = function() {
                alert("Error- Class not deleted");
            }
            makeDeleteRequest('/api/deleteTAcourse?course_number='+coursename+'&lab='+lab, onSuccess, onFailure);
        });
        showlist.on('click', '.pdelete_btn', function (e)
        {
            e.preventDefault();

            var coursename = $(this).parents('article').find('.selected_course_name').text();
            var lab = $(this).parents('article').find('.selected_lab').text();

            var onSuccess = function(data){
                location.reload();
                alert("Class Deleted");
            }
            var onFailure = function() {
                alert("Error- Class not deleted");
            }
            makeDeleteRequest('/api/deletecourse?course_number='+coursename+'&lab='+lab, onSuccess, onFailure);
        });
    }

    /**
    * Get all professors from API and display in alphabetical order by lastname
    * @return {None}
    */
    var displayCourses = function () {
        // Prepare the AJAX handlers for success and failure
        var onSuccess = function (data) {
            /* FINISH ME (Task 2): display all professors from API and display in alphabetical orded by lastname */
            var jsondata = data["courses"];
            for (var i = 0; i < jsondata.length; i++) {
                insertClass(jsondata[i], false);
            }
            console.log('Display course - success');
        };
        var onFailure = function () {
            console.error('List all courses - Failed');
        };
        /* FINISH ME (Task 2): make a GET request to get recent professors */
        let reqUrl = '/api/allcourses';
        // let reqUrl = '/api/professors?space='+professor+'&count=10&order_by=lastname'
        // console.log(reqUrl);
        makeGetRequest(reqUrl, onSuccess, onFailure);
    };

    /**
    * Add event handlers for clicking select.
    * @return {None}
    */
    var attachSelectHandler = function (e) {
        classlist.on('click', '.student_select_btn', function (e) {
            e.preventDefault();
            var courseid = $(this).parents('article').attr('id');  //FINISH ME
            console.log(courseid);
            var coursename = $(this).parents('article').find('.course_name').text();
            console.log(coursename);
            var lab = $(this).parents('article').find('.lab').text();   //FINISH ME
            console.log(lab);
            var status = $(this).parents('article').find('.status').text();   //FINISH ME
            console.log(status);

            document.getElementsByClassName("selected_prof")[0].setAttribute("id", courseid);
            document.getElementsByClassName("selected_lab")[0].innerHTML = lab;
            document.getElementsByClassName("selected_course_name")[0].innerHTML = coursename;
            document.getElementsByClassName("selected_status")[0].innerHTML = status;

            $('.nav a[href="#class"]').tab('show');
        });
        // Attach this handler to the 'click' action for elements with class 'select_prof'
        classlist.on('click', '.select_btn', function (e) {
            e.preventDefault();
            talist.html('');
            // FINISH ME (Task 4): get the id, name, title, school of the selected professor (whose select button is clicked)      
            var courseid = $(this).parents('article').attr('id');  //FINISH ME
            console.log(courseid);
            var coursename = $(this).parents('article').find('.course_name').text();
            console.log(coursename);
            var lab = $(this).parents('article').find('.lab').text();   //FINISH ME
            console.log(lab);
            // var prof = $(this).parents('article').find('.instructor').text();   //FINISH ME
            // console.log(prof);

            // var student = $(this).parents('article').find('.student').text();
            // console.log(student);

            // FINISH ME (Task 4):  update the selected_prof content in the header with these values.
            document.getElementsByClassName("selected_prof")[0].setAttribute("id", courseid);
            document.getElementsByClassName("selected_lab")[0].innerHTML = lab;
            document.getElementsByClassName("selected_course_name")[0].innerHTML = coursename;
            //document.getElementsByClassName("selected_instructor")[0].innerHTML = prof;

            var onSuccess = function(data)
            {
                var student = data.students;
                for (var s = 0; s < student.length; s++)
                {
                    var onSuccess = function(data1)
                    {
                        // var newElem = $(talistTemplateHtml);
                        // newElem.find('.student').text(data1.students[0].firstname);
                        insertTa(data1.students[0]);
                        //document.getElementsByClassName("student")[0].innerHTML = data1.students[0].firstname;
                        //activate and show the reviews tab

                    };
                    var onFailure = function(){
                        alert('FAIL');
                    };
                    makeGetRequest('/api/getstudent?id='+student[s].student_id,onSuccess, onFailure);
                }
            };

            var onFailure = function(){
                alert("FAILED");
            };

            makeGetRequest('/api/applications?course='+coursename+'&lab='+lab,onSuccess, onFailure);
            $('.nav a[href="#class"]').tab('show');
        });
    };

    // This will attach the username and password to local storage so that 
    // we will know which user is currently logged in
    var attachStudentLoginHandler = function (e) {

        $("#sign_in_form").on('click', ".sign_in_btn", function (e) {
            e.preventDefault();

            var lUsername = $("#sign_in_form").find('.name').val();
            var lPassword = $("#sign_in_form").find('.password_input').val();

            var onSuccess = function (data) {
                window.location.href = "Go_Student_Page.html";

                // clear previous local storage before setting new username & password
                window.localStorage.clear();

                window.localStorage.setItem("username", lUsername);
                window.localStorage.setItem("password", lPassword);
            };
            var onFailure = function () {
                console.error('login failed');
                alert("error - login failed")
            };
            makeGetRequest('/api/loginstudent?username=' + lUsername + '&password=' + lPassword, onSuccess, onFailure);
        });
    };

    // This will attach the username and password to local storage so that 
    // we will know which user is currently logged in
    var attachProfessorLoginHandler = function (e) {

        $("#sign_in_form").on('click', ".sign_in_btn", function (e) {
            e.preventDefault();

            var lUsername = $("#sign_in_form").find('.name').val();
            var lPassword = $("#sign_in_form").find('.password_input').val();

            var onSuccess = function (data) {
                window.location.href = "Go_Instructor_Page.html";

                // clear previous local storage before setting new username & password
                window.localStorage.clear();
                
                window.localStorage.setItem("username", lUsername);
                window.localStorage.setItem("password", lPassword);
            };
            var onFailure = function () {
                console.error('login failed');
                alert("error - login failed")
            };
            makeGetRequest('/api/loginprofessor?username=' + lUsername + '&password=' + lPassword, onSuccess, onFailure);
        });
    };

    /**
    * Get courses taught by professor
    * @return {None}
    */
    // Executed on Go_Instructor_Page.html
    var displayProfessorCourses = function () {

        var lUsername = localStorage.getItem("username");
        var lPassword = localStorage.getItem("password");
        document.getElementsByClassName("instructor_name")[0].innerHTML = lUsername;
        var onSuccess = function (data) {
            var lUsername = localStorage.getItem("username");
            var lPassword = localStorage.getItem("password");
            console.log(data)
            var jsondata = data["ProfessorsCourses"];

            for (var i = 0; i < jsondata.length; i++) {
                insertClass(jsondata[i], false);
            }
            console.log('Display course - success');
        };
        var onFailure = function () {
            console.error('List Professors courses - Failed');
        };
        
        makeGetRequest('/api/professorcourses?username=' + lUsername + '&password=' + lPassword, onSuccess, onFailure);
    };

    /**
    * Get TA applications submitted by student
    * @return {None}
    */
    // Executed on Go_Student_Page.html    
    var displayStudentApplications = function () {
        var lUsername = localStorage.getItem("username");
        var lPassword = localStorage.getItem("password");
        document.getElementsByClassName("student_name")[0].innerHTML = lUsername;
        var onSuccess = function (data) {
            var lUsername = localStorage.getItem("username");
            var lPassword = localStorage.getItem("password");
            console.log(data)
            var jsondata = data["StudentApplications"];

            for(var i = 0; i < jsondata.length; i++)
            {
                insertClass(jsondata[i], false);
            }
            console.log('Display student applications - success');
        };
        var onFailure = function () {
            console.error('List student applications - failed');
        };

        makeGetRequest('/api/studentapplications?username=' + lUsername + '&password=' + lPassword, onSuccess, onFailure);
    }

    /**
    * @return {None}
    */
    var attachEditHandler = function (e){
        $('#editStudent').on('click', ".submit_studentInfo_input", function (e) {
            e.preventDefault();
            var lUsername = localStorage.getItem("username");
            var password = localStorage.getItem("password");

            var stud = {};
            stud.firstname = edit_course.find('.firstname_edit_input').val();
            stud.lastname = edit_course.find('.lastname_edit_input').val();
            stud.id = edit_course.find('.ID_edit_input').val();
            stud.email = edit_course.find('.email_edit_input').val();
            stud.password = password;

            var onSuccess = function (data) {    
                alert("Edit Successful");
                window.localStorage.setItem("username", stud.email);
                window.location.href = "Go_Student_Page.html";
            };

            var onFailure = function () {
                alert("student cannot be created!");
                console.error('Create student - Failed');
            };

            // make a POST request to add the instructor
            makePostRequest('/api/editstudent?username='+lUsername, stud, onSuccess, onFailure);
        });

        $('#editInstructor').on('click', ".submit_InstructorInfo_input", function (e) {
            e.preventDefault();
            var lUsername = localStorage.getItem("username");
            var password = localStorage.getItem("password");

            var inst = {};
            inst.firstname = edit_course.find('.firstname_edit_input').val();
            inst.lastname = edit_course.find('.lastname_edit_input').val();
            inst.id = edit_course.find('.ID_edit_input').val();
            inst.email = edit_course.find('.email_edit_input').val();
            inst.password = password;

            var onSuccess = function (data) {    
                alert("Edit Successful");
                window.localStorage.setItem("username", inst.email);
                window.location.href = "Go_Instructor_Page.html";
            };

            var onFailure = function () {
                alert("Instructor cannot be created!");
                console.error('Create Instructor - Failed');
            };

            // make a POST request to add the instructor
            makePostRequest('/api/editinstructor?username='+lUsername, inst, onSuccess, onFailure);
        });
    }

    var assignTA = function(e) {
        // Go_Instructor_Page.html
        assign_TAinfo.on('click', '.submit_assignTA', function(e) {
            e.preventDefault();

            var lUsername = localStorage.getItem("username");
            var lPassword = localStorage.getItem("password");

            var assignTAinfo = {};

            assignTAinfo.course_number = assign_TAinfo.find('.course_name_input').val();
            assignTAinfo.lab_number = assign_TAinfo.find('.lab_input').val();
            assignTAinfo.TAname = assign_TAinfo.find('.TAname_input').val();
            assignTAinfo.TA_id = assign_TAinfo.find('.TA_id_input').val();

            var onSuccess = function(data) {
                window.alert("TA assigned successfully!");

            };
            var onFailure = function() {
                window.alert("ERROR - TA could not be assigned!");
                console.error('Assign TA - Failed');  
            };
            makePostRequest('/api/assignTA?username=' + lUsername + '&password=' + lPassword, assignTAinfo, onSuccess, onFailure);
        });
    }


    /**
    * Start the app by displaying the list of the students and attaching event handlers.
    * @return {None}
    */
    var start = function () {
        studentlist = $(".create_student_body");
        instructorlist = $(".create_instructor_body");
        courselist = $(".course_preference");
        classlist = $(".classlist");
        showlist = $(".showclass");
        talist = $(".student_list");

        console.log(window.location.href)

        // Por laptop = "file:///home/puthypor/Desktop/Fall%202019/Cpts%20322/bigdaddy/static/index.html"

        // file:///D:/WSU/Fall%202019/Cpts%20322/bigdaddy/static/index.html
        // file:///Users/nickl/Library/Mobile%20Documents/com~apple~CloudDocs/Code/Web%20Dev/bigdaddy/static/index.html"
        if (window.location.href == "file:///home/puthypor/Desktop/Fall%202019/Cpts%20322/bigdaddy/static/index.html") {
            classlistTemplateHtml = $(".classlist .class_box")[0].outerHTML;
            classlist.html('');
            talistTemplateHtml = $(".showclass .student_list")[0].outerHTML;
            //talist.html('');
            attachSelectHandler();
            displayCourses();
        }
        // Go Instructor Page
        // file:///D:/WSU/Fall%202019/Cpts%20322/bigdaddy/static/index.html
        // file:///Users/nickl/Library/Mobile%20Documents/com~apple~CloudDocs/Code/Web%20Dev/bigdaddy/static/Go_Instructor_Page.html
        if (window.location.href == "file:///home/puthypor/Desktop/Fall%202019/Cpts%20322/bigdaddy/static/Go_Instructor_Page.html") {
            classlistTemplateHtml = $(".classlist .class_box")[0].outerHTML;
            classlist.html('');
            talistTemplateHtml = $(".showclass .student_list")[0].outerHTML;
            //talist.html('');
            assign_TAinfo = $("form#assignTA"); // used when an instructor enters info to assign a TA
            assignTA();

            attachSelectHandler();
            // Display all courses in database
            //displayCourses();
            // display courses taught by specific instructor
            displayProfessorCourses();
            attachDeleteHandler();
        }
        // Go Student Page
        // file:///D:/WSU/Fall%202019/Cpts%20322/bigdaddy/static/index.html
        // file:///Users/nickl/Library/Mobile%20Documents/com~apple~CloudDocs/Code/Web%20Dev/bigdaddy/static/Go_Student_Page.html
        if (window.location.href == "file:///home/puthypor/Desktop/Fall%202019/Cpts%20322/bigdaddy/static/Go_Student_Page.html") {
            classlistTemplateHtml = $(".classlist .class_box")[0].outerHTML;
            classlist.html('');
            attachSelectHandler();
            displayStudentApplications();
            attachDeleteHandler();
        }

        if (window.location.href == "file:///home/puthypor/Desktop/Fall%202019/Cpts%20322/bigdaddy/static/Next_Student_Page.html") {
            classlistTemplateHtml = $(".classlist .class_box")[0].outerHTML;
            classlist.html('');
            displayCourses();
        }
        // Create Student Page
        // file:///Users/nickl/Library/Mobile%20Documents/com~apple~CloudDocs/Code/Web%20Dev/bigdaddy/static/Create_Student_Page.html
        if (window.location.href == "file:///home/puthypor/Desktop/Fall%202019/Cpts%20322/bigdaddy/static/Create_Student_Page.html") {
            add_student = $("form#addStudentInfoForm");
            attachStudentHandler();
        }
        // Create Instructor Page
        // file:///Users/nickl/Library/Mobile%20Documents/com~apple~CloudDocs/Code/Web%20Dev/bigdaddy/static/Create_Instructor_Page.html
        if (window.location.href == "file:///home/puthypor/Desktop/Fall%202019/Cpts%20322/bigdaddy/static/Create_Instructor_Page.html") {
            add_instructor = $("form#addInstructorInfoForm");
            attachInsructorHandler();
        }
        // Next Instructor Page
        // file:///Users/nickl/Library/Mobile%20Documents/com~apple~CloudDocs/Code/Web%20Dev/bigdaddy/static/Next_Instructor_Page.html
        if (window.location.href == "file:///home/puthypor/Desktop/Fall%202019/Cpts%20322/bigdaddy/static/Next_Instructor_Page.html") {
            add_course = $("form#addInstructorForm2");
            //attachCourseHandler();
            // Use professor specific handler
            attachProfessorCourseHandler();
        }
        // Next Student Page
        // file:///Users/nickl/Library/Mobile%20Documents/com~apple~CloudDocs/Code/Web%20Dev/bigdaddy/static/Next_Student_Page.html
        if (window.location.href == "file:///home/puthypor/Desktop/Fall%202019/Cpts%20322/bigdaddy/static/Next_Student_Page.html") {
            // add_course = $("form#addStudentInfoForm2");
            // //attachCourseHandler();
            // // Use Student specific handler
            // attachStudentCourseHandler();
            add_course = $(".classlist");
            attachStudentSelectClassButtonHandler();
        }
        // Signin Student Page
        // file:///Users/nickl/Library/Mobile%20Documents/com~apple~CloudDocs/Code/Web%20Dev/bigdaddy/static/Signin_Student_Page.html
        if (window.location.href == "file:///home/puthypor/Desktop/Fall%202019/Cpts%20322/bigdaddy/static/Signin_Student_Page.html") {
            attachStudentLoginHandler()
        }
        // Signin Instructor Page
        if (window.location.href == "file:///home/puthypor/Desktop/Fall%202019/Cpts%20322/bigdaddy/static/Signin_Instructor_Page.html") {
            attachProfessorLoginHandler()
        }

        if (window.location.href == "file:///home/puthypor/Desktop/Fall%202019/Cpts%20322/bigdaddy/static/Edit_Student_Page.html") {
            edit_course = $('form#editStudent');
            attachEditHandler();
        }

        if (window.location.href == "file:///home/puthypor/Desktop/Fall%202019/Cpts%20322/bigdaddy/static/Edit_Instructor_Page.html") {
            edit_course = $('form#editInstructor');
            attachEditHandler();
        }

    };


    // PUBLIC METHODS
    // any private methods returned in the hash are accessible via 
    // RateProfessor.key_name, e.g. RateProfessor.start()
    return {
        start: start
    };

};