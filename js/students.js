import { ENDPOINT, LIMIT } from "./const.js";



const studentsRow = document.querySelector('.students-row');
const studentForm = document.querySelector('.student-form');
const studentModal = document.querySelector('.student-modal');
const studentSearch = document.querySelector('.student-search');
const openStudentModal = document.querySelector('.open-student-modal');
const loading = document.querySelector('.loading');


loading.innerHTML = `
    <div class="loader">
        <span></span>
        <span></span>
        <span></span>
    </div>
`

// variables
let selected = null;
let search = '';


function getStudent({firstName, lastName, avatar, email, isWork, phoneNumber, teacherId, field, birthday, id}){
    console.log();
    let studentBirthday = birthday.split('T');
    return `
    <div class="card">
        <img src=${avatar} class="card-img-top" height="200" alt=${firstName, lastName}>
        <div class="card-body">
            <h5>TeacherId: ${teacherId}</h5>
            <p>FirstName: ${firstName}</p>
            <p>LastName: ${lastName}</p>
            <p>Birthday: ${studentBirthday[0]}</p>
            <p>Field: ${field}</p>
            <p>Phone: ${phoneNumber}</p>
            <p>Email: ${email}</p>
            <p>IsWork: 
            ${isWork? ` <img src="/assets/images/check.png" alt="check">`
            : `<img src="/assets/images/unchecked.png" alt="unchecked">`}
            </p>
            <p>
                <button class="btn btn-success edit-student" data-bs-toggle="modal" data-bs-target="#student-modal" studentId=${id}>Edit</button>
                <button class="btn btn-danger delete-student" studentId=${id}>Delete</button>
            </p>
        </div>
    </div>
    `
}

async function getStudents(){
    try{
        let query = new URLSearchParams(location.search);
        let teacherId = query.get('teacherId');

        const params = {search}
        let {data: students} = await axios.get(`${ENDPOINT}teachers/${teacherId}/student`, {params});

        studentsRow.innerHTML = " "
        students.forEach(element => {
            studentsRow.innerHTML += getStudent(element);
        });

        const editStudent = document.querySelectorAll('.edit-student');
        const deleteStudent = document.querySelectorAll('.delete-student');

        editStudent.forEach(el =>{
           el.addEventListener('click', async function(){
                selected = this.getAttribute('studentId');
                let {data: student} = await axios.get(`${ENDPOINT}teachers/${teacherId}/student/${selected}`)
                studentForm.elements.firstName.value = student.firstName;
                studentForm.elements.lastName.value = student.lastName;
                studentForm.elements.avatar.value = student.avatar;
                studentForm.elements.date.value = student.birthday;
                studentForm.elements.studentWork.checked = student.isWork;
                studentForm.elements.field.value = student.field;
                studentForm.elements.tel.value = student.phoneNumber;
           })
        });

        deleteStudent.forEach(el =>{
            el.addEventListener('click', async function(){
                let studentId = this.getAttribute('studentId');
                let check = window.confirm(`Do you want delete?`);
                if(check){
                    await axios.delete(`${ENDPOINT}teachers/${teacherId}/student/${studentId}`);
                    getStudents();
                }
            })
        })
        loading.style.display = "none";
    }catch(err){
        console.log(err);
    }
}

getStudents();

studentSearch.addEventListener('keyup', function(){
    search = this.value;
    getStudents();
})

studentForm.addEventListener('submit', async function(e){
    e.preventDefault();
    if(this.checkValidity()){
        let student = {
            firstName: this.elements.firstName.value,
            lastName: this.elements.lastName.value,
            avatar: this.elements.avatar.value,
            birthday: this.elements.date.value,
            isWork: this.elements.studentWork.checked,
            field: this.elements.field.value,
            phoneNumber: this.elements.tel.value,
        }
        if(selected === null){
            await axios.post(`${ENDPOINT}teachers/${teacherId}/student`, student);
        }else{
            await axios.put(`${ENDPOINT}teachers/${teacherId}/student/${selected}`, student)
        }
        getStudents();
        bootstrap.Modal.getInstance(studentModal).hide();
        this.reset();
        
    }else{
        this.classList.add('was-validated');
    }
})

openStudentModal.addEventListener('click', function(){
    selected = null;
})
