import { ENDPOINT, LIMIT } from "./const.js";

const teachersRow = document.querySelector('.teachers__row');
const searchInput = document.querySelector('.search-input');
const teachersNumberInfo = document.querySelector('.teachers-number-info');
const teachersNumberInfoDiv = document.querySelector('.alert-primary')
const teacherFilter = document.querySelector('.teacher-select');
const pagination = document.querySelector('.pagination');
const teacherModal = document.querySelector('.teacher-modal');
const modalClose = document.querySelector('.modal-close');
const modalClose2 = document.querySelector('.modal-close-2');
const teacherForm = document.querySelector('.teacher-form');
const modalOpenBtn = document.querySelector('.modal-open-btn');
const loading = document.querySelector('.loading');


loading.innerHTML = `
    <div class="loader">
        <span></span>
        <span></span>
        <span></span>
    </div>
`

// variables
let search = '';
let activePage = 1;
let filter = '';
let selected = null;

function getTeacher({ firstName, lastName, avatar, email, isMarried, phoneNumber, groups, id }) {
    return `
    <div class="card">
        <a href="./students.html?teacherId=${id}">
            <img src=${avatar} class="card-img"  height="200" alt=${firstName, lastName}>
        </a>
        <div class="card-body">
        <p>FirtsName: ${firstName}</p>
        <p>LastName: ${lastName}</p>
        <p>Groups: ${groups}</p>
        <p>Email: ${email}</p>
        <p>Phone: ${phoneNumber}</p>
        <p>
            Ismarried:
            ${isMarried ? ` <img src="/assets/images/check.png" alt="check">`
            : `<img src="/assets/images/unchecked.png" alt="unchecked">`}  
        </p>
        <button class="btn btn-success teacher-edit" data-bs-toggle="modal"  data-bs-target="#exampleModal" data-bs-toggle="modal" data-bs-target="#teacher__modal" teacherId=${id}>Edit</button>
        <button class="btn btn-danger delete-teacher-btn" teacherId=${id}>Delete</button>
        </div>
    </div>
    `
}




async function getTeachers() {
    try {
        const [filterField, order] = filter.split('-');
        const params = { search, page: activePage, limit: LIMIT, sortby: filterField, order};
        
        let query = new URLSearchParams(params);
        history.pushState({}, "", `index.html?${query}`);

        const { data: teachers } = await axios.get(`${ENDPOINT}teachers`, { params });
        const { data: allTeachers } = await axios.get(`${ENDPOINT}teachers`, { params: { search } });


        // pagination
        if (allTeachers.length < LIMIT) {
            pagination.innerHTML = ""
        } else {
            let pages = Math.ceil(allTeachers.length / LIMIT);
            pagination.innerHTML = ` <li class="page-item ${activePage === 1 ? 'disabled' : ''}"><button class="page-link">Previous</button></li>`

            for (let i = 1; i <= pages; i++) {
                pagination.innerHTML += `<li class="page-item ${i === activePage ? 'active' : ''}"><button class="page-link">${i}</button></li>`
            }

            pagination.innerHTML += `<li class="page-item  ${activePage === pages ? 'disabled' : ''}"><button class="page-link">Next</button></li>`

            const paginationItems = document.querySelectorAll('.page-link')

            paginationItems.forEach((item, i) => {
                if (i === 0) {
                    item.addEventListener('click', () => { getPage('-') })
                } else if (i === paginationItems.length - 1) {
                    item.addEventListener('click', () => { getPage('+') })
                } else {
                    item.addEventListener('click', () => { getPage(i) })
                }
            })

            function getPage(i) {
                if (i === '+') {
                    activePage++;
                } else if (i === '-') {
                    activePage--;
                } else {
                    activePage = i;
                }
                getTeachers();
            }
        }
        // pagination end

        if(allTeachers.length < 4){
            teachersNumberInfoDiv.style.display = "none"
        }else{
            teachersNumberInfoDiv.style.display = "block"
            teachersNumberInfo.textContent = allTeachers.length
        }
        teachersRow.innerHTML = "";
        teachers.forEach(element => {
            teachersRow.innerHTML += getTeacher(element);
        });

        // edit teacher
        const editTeacher = document.querySelectorAll('.teacher-edit');
        const deleteTeacherBtns = document.querySelectorAll('.delete-teacher-btn');


        editTeacher.forEach(el => {
            el.addEventListener('click', async function () {
                selected = this.getAttribute('teacherId');
                let { data: teacher } = await axios.get(`${ENDPOINT}teachers/${selected}`);
                teacherForm.elements.firstName.value = teacher.firstName;
                teacherForm.elements.lastName.value = teacher.lastName;
                teacherForm.elements.avatar.value = teacher.avatar;
                teacherForm.elements.isMarried.checked = teacher.isMarried;
                teacherForm.elements.groups.value = teacher.groups.toString();
                teacherForm.elements.number.value = teacher.phoneNumber;
            })
        })

        deleteTeacherBtns.forEach((deletBtn) => {
            deletBtn.addEventListener('click', async function () {
                let check = window.confirm('Do you want to delete this teacher ?');
                if (check) {
                    const teacherId = this.getAttribute('teacherId')
                    await axios.delete(`${ENDPOINT}teachers/${teacherId}`);
                    activePage = 1;
                    getTeachers();
                }
            })
        })
        // edit end
        loading.style.display = "none";
    } catch (err) {
        console.log(err);
    }
}
getTeachers();

searchInput.addEventListener('keyup', function () {
    search = this.value;
    getTeachers();
});

teacherForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    if (this.checkValidity()) {
        let teacher = {
            firstName: this.elements.firstName.value,
            lastName: this.elements.lastName.value,
            avatar: this.elements.avatar.value,
            groups: this.elements.groups.value.split(','),
            phoneNumber: this.elements.number.value,
            isMarried: this.elements.isMarried.checked,
        }
        if (selected === null) {
            await axios.post(`${ENDPOINT}teachers`, teacher);
        } else {
            await axios.put(`${ENDPOINT}teachers/${selected}`, teacher);
        }
        getTeachers();
        bootstrap.Modal.getInstance(teacherModal).hide();
        this.reset();
    } else {
        this.classList.add('was-validated');
    }

});

modalOpenBtn.addEventListener('click', () => {
    selected = null;
});

teacherFilter.addEventListener('change', function(){
    filter = this.value;
    getTeachers();
});

modalClose.addEventListener('click', function(){
    teacherForm.reset();
})

modalClose2.addEventListener('click', function(){
    teacherForm.reset();
})